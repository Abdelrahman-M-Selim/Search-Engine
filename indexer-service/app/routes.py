from fastapi import APIRouter, status
from app.consumer import is_kafka_connected
from app.indexer import get_index_stats, index_page, is_db_connected
from app.schemas import (
    HealthResponse,
    IndexPageRequest,
    IndexPageResponse,
    IndexStatusResponse,
    TokenizeRequest,
    TokenizeResponse,
)
from app.tokenizer import count_term_frequencies, tokenize

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    tags=["Health"],
)
async def health_check() -> HealthResponse:
    """Return health status of the Indexer Service."""
    return HealthResponse(
        status="healthy",
        service="indexer-service",
        version="0.1.0",
    )


@router.get(
    "/index/status",
    response_model=IndexStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Inverted Index Status & Statistics",
    tags=["Index"],
)
async def index_status() -> IndexStatusResponse:
    """Return current inverted index statistics and connectivity status."""
    total_pages, total_terms = await get_index_stats()
    return IndexStatusResponse(
        service="indexer-service",
        status="online",
        total_indexed_pages=total_pages,
        total_unique_terms=total_terms,
        database_connected=is_db_connected(),
        kafka_connected=is_kafka_connected(),
    )


@router.post(
    "/index/tokenize",
    response_model=TokenizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Tokenize Raw Text (Debug / Utility)",
    tags=["Tokenizer"],
)
async def tokenize_text(payload: TokenizeRequest) -> TokenizeResponse:
    """Tokenize arbitrary text, filter stopwords, and compute term frequencies."""
    tokens = tokenize(payload.text)
    term_freqs = count_term_frequencies(tokens)

    return TokenizeResponse(
        raw_text=payload.text,
        token_count=len(tokens),
        unique_terms_count=len(term_freqs),
        tokens=tokens,
        term_frequencies=term_freqs,
    )


@router.post(
    "/index/page",
    response_model=IndexPageResponse,
    status_code=status.HTTP_200_OK,
    summary="Index Single Page Manually",
    tags=["Index"],
)
async def index_single_page(payload: IndexPageRequest) -> IndexPageResponse:
    """
    Manually index a page by providing its text content.
    Useful for testing indexing pipeline without requiring Crawler or Kafka.
    """
    result = await index_page(
        page_id=payload.page_id,
        content=payload.content,
        title=payload.title or "",
        url=payload.url,
    )

    return IndexPageResponse(
        page_id=result["page_id"],
        url=result.get("url"),
        unique_terms_count=result.get("unique_terms_count", 0),
        status=result.get("status", "success"),
        message=result.get("message", "Page processed"),
    )

from fastapi import HTTPException
from app.indexer import get_top_terms, get_term_postings

@router.get("/index/terms", summary="Get top terms")
async def fetch_top_terms(page: int = 1, limit: int = 100):
    return await get_top_terms(page, limit)

@router.get("/index/terms/{term}", summary="Get postings for a term")
async def fetch_term_postings(term: str, page: int = 1, limit: int = 50):
    res = await get_term_postings(term, page, limit)
    if not res:
        raise HTTPException(status_code=404, detail="Term not found")
    return res
