import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.cache import close_redis_pool, init_redis_pool
from app.config import get_settings
from app.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("search-service")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    logger.info("Starting Search Service...")
    # Initialize connection pools (Redis, etc.)
    await init_redis_pool()
    yield
    # Cleanup on shutdown
    logger.info("Shutting down Search Service...")
    await close_redis_pool()


settings = get_settings()

app = FastAPI(
    title="Search Service",
    description="Search engine service for query processing, caching, and result retrieval.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(router)


@app.get("/", tags=["Root"])
async def root():
    """Service root endpoint returning basic metadata."""
    return {
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
