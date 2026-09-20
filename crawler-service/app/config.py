from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@postgres:5432/search_engine"
    kafka_broker: str = "kafka:9092"
    page_crawled_topic: str = "page_crawled"
    crawl_concurrency: int = 10
    max_depth: int = 3

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
