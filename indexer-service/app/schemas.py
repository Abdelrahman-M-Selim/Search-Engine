from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(default="healthy", description="Current health status of the service")
    service: str = Field(default="indexer-service", description="Name of the service")
    version: str = Field(default="0.1.0", description="API version")


class IndexStatusResponse(BaseModel):
    """Response payload structure for index status."""

    service: str = Field(default="indexer-service", description="Name of the service")
    status: str = Field(default="online", description="Indexer operational status")
    total_indexed_pages: int = Field(default=0, description="Total distinct pages indexed in inverted index")
    total_unique_terms: int = Field(default=0, description="Total distinct terms recorded in inverted index")
    database_connected: bool = Field(default=False, description="PostgreSQL connectivity flag")
    kafka_connected: bool = Field(default=False, description="Kafka consumer operational status")


class TokenizeRequest(BaseModel):
    """Request payload for testing tokenization directly."""

    text: str = Field(..., min_length=1, description="Raw text string to tokenize")


class TokenizeResponse(BaseModel):
    """Response payload returning tokens and term frequencies."""

    raw_text: str = Field(..., description="Original raw text input")
    token_count: int = Field(..., description="Total number of filtered tokens")
    unique_terms_count: int = Field(..., description="Total unique terms")
    tokens: List[str] = Field(default_factory=list, description="Extracted filtered tokens")
    term_frequencies: Dict[str, int] = Field(
        default_factory=dict, description="Calculated term frequency mapping"
    )


class IndexPageRequest(BaseModel):
    """Payload to manually trigger indexing on a page."""

    page_id: int = Field(..., ge=1, description="Database ID of the page")
    url: Optional[str] = Field(default=None, description="Page URL")
    title: Optional[str] = Field(default="", description="Page title")
    content: str = Field(..., min_length=1, description="Page text content to index")


class IndexPageResponse(BaseModel):
    """Response returned after indexing a page."""

    page_id: int = Field(..., description="ID of the indexed page")
    url: Optional[str] = Field(default=None, description="Page URL")
    unique_terms_count: int = Field(..., description="Count of unique terms added to index")
    status: str = Field(default="success", description="Status of the indexing operation")
    message: str = Field(..., description="Detailed result message")
