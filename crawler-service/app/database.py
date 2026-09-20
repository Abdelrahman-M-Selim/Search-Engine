import asyncpg
from app.config import settings

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(
            dsn=settings.database_url,
            min_size=2,
            max_size=20
        )
        async with self.pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS crawler_frontier (
                    url TEXT PRIMARY KEY,
                    depth INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'PENDING'
                );
            """)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def add_seed(self, url: str):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO crawler_frontier (url, depth, status)
                VALUES ($1, $2, 'PENDING')
                ON CONFLICT (url) DO NOTHING
            """, url, 0)

    async def pop_urls(self, limit: int):
        async with self.pool.acquire() as conn:
            return await conn.fetch("""
                UPDATE crawler_frontier
                SET status = 'PROCESSING'
                WHERE url IN (
                    SELECT url FROM crawler_frontier
                    WHERE status = 'PENDING'
                    LIMIT $1
                    FOR UPDATE SKIP LOCKED
                )
                RETURNING url, depth
            """, limit)

    async def mark_done(self, url: str):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE crawler_frontier
                SET status = 'DONE'
                WHERE url = $1
            """, url)
            
    async def add_urls(self, urls: list[tuple[str, int]]):
        async with self.pool.acquire() as conn:
            await conn.executemany("""
                INSERT INTO crawler_frontier (url, depth, status)
                VALUES ($1, $2, 'PENDING')
                ON CONFLICT (url) DO NOTHING
            """, urls)

db = Database()
