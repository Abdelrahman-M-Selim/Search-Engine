import json
import logging
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Query, status

from app.cache import get_cache, set_cache
from app.db import execute_search
from app.kafka_producer import publish_search_performed
from app.schemas import HealthResponse, SearchResponse, SearchResultItem

logger = logging.getLogger(__name__)
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
    background_tasks: BackgroundTasks,
    q: str = Query(
        ...,
        min_length=1,
        description="Search query text",
        examples=["computer science", "database"],
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
    user_id: Optional[str] = Query(
        default=None,
        description="Optional user ID for personalized search analytics",
    ),
) -> SearchResponse:
    """
    Search endpoint executing full pipeline:
    1. Check Redis cache for cached query results.
    2. On miss, search inverted index in PostgreSQL & rank matches.
    3. Store results in Redis cache.
    4. Publish `search_performed` event to Kafka in background.
    5. Return paginated response.
    """
    normalized_q = q.strip().lower()
    cache_key = f"search:{normalized_q}:{page}:{limit}"

    # 1. Check Redis cache
    cached_data = await get_cache(cache_key)
    if cached_data:
        try:
            cached_json = json.loads(cached_data)
            logger.info("Cache HIT for query='%s' (page=%d)", normalized_q, page)
            # Publish analytics in background
            background_tasks.add_task(
                publish_search_performed,
                query=q,
                result_count=cached_json.get("total_results", 0),
                user_id=user_id,
            )
            return SearchResponse(**cached_json)
        except Exception as exc:
            logger.warning("Error deserializing cached search response: %s", exc)

    logger.info("Cache MISS for query='%s' (page=%d)", normalized_q, page)

    # 2. Query PostgreSQL
    total_results, raw_results = await execute_search(
        query_text=q,
        page=page,
        limit=limit,
    )

    results = [
        SearchResultItem(
            page_id=item["page_id"],
            title=item["title"],
            url=item["url"],
            snippet=item["snippet"],
        )
        for item in raw_results
    ]

    response = SearchResponse(
        query=q.strip(),
        total_results=total_results,
        page=page,
        limit=limit,
        results=results,
    )

    # 3. Store in Redis cache
    try:
        await set_cache(cache_key, response.model_dump_json())
    except Exception as exc:
        logger.warning("Failed to store search response in cache: %s", exc)

    # 4. Publish search event to Kafka in background
    background_tasks.add_task(
        publish_search_performed,
        query=q,
        result_count=total_results,
        user_id=user_id,
    )

    return response
