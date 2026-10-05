from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
ROOT_ENV_FILE = ROOT_DIR / ".env"
LOCAL_ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@postgres:5432/search_engine"
    kafka_broker: str = "kafka:9092"
    page_crawled_topic: str = "page_crawled"
    crawl_concurrency: int = 10
    max_depth: int = 3

    model_config = SettingsConfigDict(
        env_file=str(ROOT_ENV_FILE) if ROOT_ENV_FILE.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
