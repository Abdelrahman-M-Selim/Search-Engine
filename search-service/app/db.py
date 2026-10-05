import logging
import re
from typing import Any, Dict, List, Optional, Tuple
import asyncpg
from app.config import get_settings
from app.tokenizer import tokenize

logger = logging.getLogger(__name__)

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
        logger.warning("PostgreSQL connection failed on startup: %s", exc)
        db_pool = None


async def close_db_pool() -> None:
    """Close the PostgreSQL connection pool."""
    global db_pool
    if db_pool:
        try:
            await db_pool.close()
            logger.info("PostgreSQL connection pool closed.")
        except Exception as exc:
            logger.warning("Error closing PostgreSQL pool: %s", exc)


def is_db_connected() -> bool:
    return db_pool is not None


def generate_snippet(content: str, terms: List[str], max_length: int = 200) -> str:
    """Generate a snippet of content around the first matching term."""
    if not content:
        return ""
    
    clean_content = " ".join(content.split())
    if not terms:
        return clean_content[:max_length] + ("..." if len(clean_content) > max_length else "")

    # Find the position of the first matching term
    lower_content = clean_content.lower()
    first_idx = -1
    for term in terms:
        idx = lower_content.find(term.lower())
        if idx != -1 and (first_idx == -1 or idx < first_idx):
            first_idx = idx

    if first_idx == -1:
        return clean_content[:max_length] + ("..." if len(clean_content) > max_length else "")

    start = max(0, first_idx - 60)
    end = min(len(clean_content), start + max_length)
    
    snippet = clean_content[start:end]
    if start > 0:
        snippet = "..." + snippet
    if end < len(clean_content):
        snippet = snippet + "..."
    return snippet


async def execute_search(
    query_text: str,
    page: int = 1,
    limit: int = 10,
) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Search inverted_index and pages tables in PostgreSQL.
    Returns (total_results, list_of_result_items).
    """
    if not db_pool:
        logger.warning("DB pool is unavailable, returning empty search results.")
        return 0, []

    terms = tokenize(query_text)
    if not terms:
        # Fallback to simple split if tokenizer removed everything
        terms = [w.lower() for w in query_text.strip().split() if w]
    
    if not terms:
        return 0, []

    offset = (page - 1) * limit

    try:
        async with db_pool.acquire() as conn:
            # Query matching pages and rank by score (sum of term frequencies + match count)
            sql = """
                WITH ranked_pages AS (
                    SELECT 
                        p.id AS page_id,
                        p.url,
                        p.title,
                        p.content,
                        COUNT(DISTINCT ii.term) AS matched_terms,
                        SUM(ii.term_frequency) AS score
                    FROM inverted_index ii
                    JOIN pages p ON p.id = ii.page_id
                    WHERE ii.term = ANY($1::text[])
                    GROUP BY p.id, p.url, p.title, p.content
                )
                SELECT 
                    page_id,
                    url,
                    title,
                    content,
                    matched_terms,
                    score,
                    COUNT(*) OVER() AS total_count
                FROM ranked_pages
                ORDER BY matched_terms DESC, score DESC
                LIMIT $2 OFFSET $3;
            """
            rows = await conn.fetch(sql, terms, limit, offset)

            if not rows:
                return 0, []

            total_results = rows[0]["total_count"]
            results = []
            for row in rows:
                results.append({
                    "page_id": row["page_id"],
                    "url": row["url"],
                    "title": row["title"] or row["url"],
                    "snippet": generate_snippet(row["content"] or "", terms),
                })

            return total_results, results

    except Exception as exc:
        logger.error("Search query execution failed: %s", exc)
        return 0, []
