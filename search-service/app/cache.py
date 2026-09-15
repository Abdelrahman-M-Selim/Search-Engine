import logging
from typing import Optional
import redis.asyncio as aioredis
from app.config import get_settings

logger = logging.getLogger(__name__)

# Global Redis client instance
redis_client: Optional[aioredis.Redis] = None


async def init_redis_pool() -> None:
    """Initialize the Redis connection pool."""
    global redis_client
    settings = get_settings()
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await redis_client.ping()
        logger.info("Connected to Redis successfully.")
    except Exception as exc:
        logger.warning(
            "Redis connection failed on startup. Service will fail-open: %s",
            exc,
        )
        # Keep client set even if initial ping failed, or None depending on retry preference


async def close_redis_pool() -> None:
    """Close the Redis connection pool."""
    global redis_client
    if redis_client:
        try:
            await redis_client.aclose()
            logger.info("Redis connection closed.")
        except Exception as exc:
            logger.warning("Error closing Redis connection: %s", exc)


async def get_cache(key: str) -> Optional[str]:
    """
    Retrieve cached value for a key (fail-open).
    Returns None if cache is unavailable or key not found.
    """
    global redis_client
    if not redis_client:
        return None
    try:
        return await redis_client.get(key)
    except Exception as exc:
        logger.warning("Redis GET failed for key '%s': %s (failing open)", key, exc)
        return None


async def set_cache(key: str, value: str, ttl: Optional[int] = None) -> bool:
    """
    Store value in cache with optional TTL in seconds (fail-open).
    Returns True if successful, False otherwise.
    """
    global redis_client
    if not redis_client:
        return False
    try:
        settings = get_settings()
        expiration = ttl if ttl is not None else settings.CACHE_TTL_SECONDS
        await redis_client.set(key, value, ex=expiration)
        return True
    except Exception as exc:
        logger.warning("Redis SET failed for key '%s': %s (failing open)", key, exc)
        return False
