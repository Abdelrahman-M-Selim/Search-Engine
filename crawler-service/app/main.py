import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import db
from app.kafka_producer import kafka_client
from app.crawler_engine import crawler
from app.schemas import SeedRequest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    await kafka_client.start()
    await crawler.start()
    yield
    await crawler.stop()
    await kafka_client.stop()
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

@app.post("/seed")
async def add_seed(request: SeedRequest):
    await db.add_seed(str(request.url))
    if not crawler.running:
        await crawler.start()
    return {"status": "seed added", "url": str(request.url)}

@app.post("/stop")
async def stop_crawler():
    await crawler.stop()
    return {"status": "stopped"}

@app.get("/status")
async def get_status():
    async with db.pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM pages")
    return {
        "pages_crawled": count or 0,
        "in_progress": crawler.running
    }

@app.get("/pages")
async def get_recent_pages(page: int = 1, limit: int = 50):
    return await db.get_recent_pages(page, limit)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
