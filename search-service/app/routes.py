from fastapi import APIRouter, Query, status
from app.schemas import HealthResponse, SearchResponse, SearchResultItem

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    tags=["Health"],
)
async def health_check() -> HealthResponse:
    """Return health status of the Search Service."""
    return HealthResponse(
        status="healthy",
        service="search-service",
        version="0.1.0",
    )


@router.get(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Search Query Endpoint",
    tags=["Search"],
)
async def search(
    q: str = Query(
        ...,
        min_length=1,
        description="Search query text",
        examples=["distributed systems"],
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="Page number for pagination",
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Number of results per page",
    ),
) -> SearchResponse:
    """
    Search endpoint stub.
    
    Planned execution flow:
    1. Check Redis cache for cached query results.
    2. Tokenize and parse incoming query `q`.
    3. Query `inverted_index` in PostgreSQL and rank matching pages.
    4. Fetch page metadata (title, URL, snippet) for top results.
    5. Store results in Redis cache.
    6. Publish `search_performed` event to Kafka.
    7. Return paginated response.
    """
    # Setup placeholder response (business logic to be implemented)
    return SearchResponse(
        query=q.strip(),
        total_results=0,
        page=page,
        limit=limit,
        results=[],
    )
