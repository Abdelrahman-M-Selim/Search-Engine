from typing import List
from pydantic import BaseModel, Field


class SearchResultItem(BaseModel):
    """Represents a single search result item."""

    page_id: int = Field(..., description="Unique identifier of the page")
    title: str = Field(..., description="Title of the page")
    url: str = Field(..., description="URL of the indexed page")
    snippet: str = Field(..., description="Short content snippet with query context")


class SearchResponse(BaseModel):
    """Response payload structure for search query requests."""

    query: str = Field(..., description="The query string executed")
    total_results: int = Field(..., description="Total matching documents found")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of results requested per page")
    results: List[SearchResultItem] = Field(
        default_factory=list, description="Ranked list of search results"
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(default="healthy", description="Current health status of the service")
    service: str = Field(default="search-service", description="Name of the service")
    version: str = Field(default="0.1.0", description="API version")
