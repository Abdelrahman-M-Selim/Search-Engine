from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
ROOT_ENV_FILE = ROOT_DIR / ".env"
LOCAL_ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    # Service Configuration
    SERVICE_NAME: str = "search-service"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Database Configuration (PostgreSQL)
    DATABASE_URL: str = "postgresql://user:password@postgres:5432/search_engine"

    # Cache Configuration (Redis)
    REDIS_URL: str = "redis://redis:6379/0"
    CACHE_TTL_SECONDS: int = 300

    # Kafka Configuration
    KAFKA_BROKER: str = "kafka:9092"
    SEARCH_PERFORMED_TOPIC: str = "search_performed"

    # Search Defaults
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV_FILE) if ROOT_ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
