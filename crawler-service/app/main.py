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
    return {"status": "seed added", "url": str(request.url)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
