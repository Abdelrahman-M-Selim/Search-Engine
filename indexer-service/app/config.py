from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Root project directory and service directory paths
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
ROOT_ENV_FILE = ROOT_DIR / ".env"
LOCAL_ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""

    # Service Configuration
    SERVICE_NAME: str = "indexer-service"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Database Configuration (PostgreSQL)
    DATABASE_URL: str = "postgresql://user:password@postgres:5432/search_engine"

    # Kafka Configuration
    KAFKA_BROKER: str = "kafka:9092"
    PAGE_CRAWLED_TOPIC: str = "page_crawled"
    KAFKA_GROUP_ID: str = "indexer-group"
    KAFKA_AUTO_OFFSET_RESET: str = "earliest"

    # Indexer & Tokenizer Settings
    MIN_WORD_LENGTH: int = 2
    MAX_WORD_LENGTH: int = 50

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV_FILE) if ROOT_ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
