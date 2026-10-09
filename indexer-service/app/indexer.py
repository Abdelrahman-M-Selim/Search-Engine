import logging
from typing import Any, Dict, Optional, Tuple
import asyncpg
from app.config import get_settings
from app.tokenizer import count_term_frequencies, tokenize

logger = logging.getLogger(__name__)

# Global asyncpg connection pool
db_pool: Optional[asyncpg.Pool] = None


async def init_db_pool() -> None:
    """Initialize the PostgreSQL connection pool."""
    global db_pool
    settings = get_settings()
    try:
        db_pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=10.0,
        )
        logger.info("Connected to PostgreSQL database successfully.")
    except Exception as exc:
        logger.warning(
            "PostgreSQL connection failed on startup (%s). Service will operate in degraded/fail-open mode.",
            exc,
        )
        db_pool = None


async def close_db_pool() -> None:
    """Close the PostgreSQL connection pool."""
    global db_pool
    if db_pool:
        try:
            await db_pool.close()
            logger.info("PostgreSQL connection pool closed.")
        except Exception as exc:
            logger.warning("Error closing PostgreSQL connection pool: %s", exc)


def is_db_connected() -> bool:
    """Check if database pool is initialized."""
    return db_pool is not None


async def fetch_page_by_id(page_id: int) -> Optional[Dict[str, Any]]:
    """Fetch page metadata and content from the pages table."""
    if not db_pool:
        return None
    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, url, title, content FROM pages WHERE id = $1",
                page_id,
            )
            if row:
                return dict(row)
            return None
    except Exception as exc:
        logger.error("Failed to fetch page %s from database: %s", page_id, exc)
        return None


async def index_page(
    page_id: int,
    content: str,
    title: str = "",
    url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Process page text, calculate term frequencies, and upsert into inverted_index table.
    Uses a database transaction for consistency.
    """
    # Combine title and content for indexing
    full_text = f"{title} {content}"
    tokens = tokenize(full_text)
    term_frequencies = count_term_frequencies(tokens)

    if not term_frequencies:
        return {
            "page_id": page_id,
            "url": url,
            "unique_terms_count": 0,
            "status": "skipped",
            "message": "No indexable terms found in page content",
        }

    if not db_pool:
        logger.warning(
            "DB pool unavailable. Processed %d unique terms for page_id %d (in-memory only).",
            len(term_frequencies),
            page_id,
        )
        return {
            "page_id": page_id,
            "url": url,
            "unique_terms_count": len(term_frequencies),
            "status": "success_memory_only",
            "message": "Indexed in-memory (DB offline)",
        }

    try:
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                # Prepare rows: (term, page_id, term_frequency)
                records = [
                    (term, page_id, freq)
                    for term, freq in term_frequencies.items()
                ]

                # Delete existing entries for this page to handle re-indexing cleanly
                await conn.execute(
                    "DELETE FROM inverted_index WHERE page_id = $1",
                    page_id,
                )

                # Batch insert term frequencies
                await conn.executemany(
                    """
                    INSERT INTO inverted_index (term, page_id, term_frequency)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (term, page_id)
                    DO UPDATE SET term_frequency = EXCLUDED.term_frequency
                    """,
                    records,
                )

        logger.info(
            "Successfully indexed page_id %d with %d unique terms.",
            page_id,
            len(term_frequencies),
        )
        return {
            "page_id": page_id,
            "url": url,
            "unique_terms_count": len(term_frequencies),
            "status": "success",
            "message": f"Successfully indexed {len(term_frequencies)} unique terms.",
        }

    except Exception as exc:
        logger.error("Failed to index page %d: %s", page_id, exc)
        return {
            "page_id": page_id,
            "url": url,
            "unique_terms_count": len(term_frequencies),
            "status": "error",
            "message": str(exc),
        }


async def get_index_stats() -> Tuple[int, int]:
    """
    Retrieve statistics from the inverted_index table.
    Returns (total_indexed_pages, total_unique_terms).
    """
    if not db_pool:
        return 0, 0

    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT 
                    COUNT(DISTINCT page_id) AS total_pages,
                    COUNT(DISTINCT term) AS total_terms
                FROM inverted_index
                """
            )
            if row:
                return (
                    row["total_pages"] or 0,
                    row["total_terms"] or 0,
                )
            return 0, 0
    except Exception as exc:
        logger.warning("Failed to query index stats from DB: %s", exc)
        return 0, 0

async def get_top_terms(page: int = 1, limit: int = 100):
    if not db_pool: return {"items": [], "total": 0, "page": page, "size": limit, "total_pages": 1}
    offset = (page - 1) * limit
    async with db_pool.acquire() as conn:
        total = await conn.fetchval("SELECT COUNT(DISTINCT term) FROM inverted_index")
        records = await conn.fetch(
            """
            SELECT term, COUNT(page_id) as doc_count 
            FROM inverted_index 
            GROUP BY term 
            ORDER BY doc_count DESC 
            LIMIT $1 OFFSET $2
            """, limit, offset
        )
        items = [{"term": r["term"], "doc_count": r["doc_count"]} for r in records]
        return {
            "items": items,
            "total": total,
            "page": page,
            "size": limit,
            "total_pages": (total + limit - 1) // limit if total else 1
        }

async def get_term_postings(term: str, page: int = 1, limit: int = 50):
    if not db_pool: return None
    offset = (page - 1) * limit
    async with db_pool.acquire() as conn:
        doc_count = await conn.fetchval(
            "SELECT COUNT(page_id) FROM inverted_index WHERE term = $1", term
        )
        if not doc_count:
            return None
        
        records = await conn.fetch(
            """
            SELECT i.page_id, i.term_frequency, p.title, p.url 
            FROM inverted_index i 
            JOIN pages p ON i.page_id = p.id 
            WHERE i.term = $1 
            ORDER BY i.term_frequency DESC
            LIMIT $2 OFFSET $3
            """, term, limit, offset
        )
        occurrences = [
            {
                "page_id": r["page_id"],
                "title": r["title"] or "No Title",
                "url": r["url"],
                "term_frequency": r["term_frequency"]
            } for r in records
        ]
        
        return {
            "term": term,
            "doc_count": doc_count,
            "occurrences": occurrences,
            "page": page,
            "size": limit,
            "total_pages": (doc_count + limit - 1) // limit if doc_count else 1
        }
