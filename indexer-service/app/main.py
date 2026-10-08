import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.consumer import start_kafka_consumer, stop_kafka_consumer
from app.indexer import close_db_pool, init_db_pool
from app.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("indexer-service")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    logger.info("Starting Indexer Service...")
    # Initialize connection pools
    await init_db_pool()
    # Start Kafka background consumer
    await start_kafka_consumer()
    yield
    # Cleanup on shutdown
    logger.info("Shutting down Indexer Service...")
    await stop_kafka_consumer()
    await close_db_pool()


settings = get_settings()

app = FastAPI(
    title="Indexer Service",
    description="Inverted index builder and maintainer service consuming crawled pages.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
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
