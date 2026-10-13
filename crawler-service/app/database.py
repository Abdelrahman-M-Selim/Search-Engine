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
                CREATE TABLE IF NOT EXISTS pages (
                    id SERIAL PRIMARY KEY,
                    url TEXT UNIQUE NOT NULL,
                    title TEXT,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    async def save_page(self, url: str, title: str, content: str) -> int:
        async with self.pool.acquire() as conn:
            return await conn.fetchval("""
                INSERT INTO pages (url, title, content)
                VALUES ($1, $2, $3)
                ON CONFLICT (url) DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    created_at = CURRENT_TIMESTAMP
                RETURNING id
            """, url, title, content)

    async def get_recent_pages(self, page: int = 1, limit: int = 10):
        if not self.pool: return {"items": [], "total": 0, "page": page, "size": limit, "total_pages": 1}
        offset = (page - 1) * limit
        async with self.pool.acquire() as conn:
            total = await conn.fetchval("SELECT COUNT(*) FROM pages")
            records = await conn.fetch("""
                SELECT id, url, title, content, created_at
                FROM pages
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            """, limit, offset)
            
            results = []
            for r in records:
                results.append({
                    "id": r["id"],
                    "url": r["url"],
                    "title": r["title"] or "No Title",
                    "status_code": 200,
                    "word_count": len(str(r["content"]).split()) if r["content"] else 0,
                    "crawled_at": r["created_at"].isoformat()
                })
            return {
                "items": results,
                "total": total,
                "page": page,
                "size": limit,
                "total_pages": (total + limit - 1) // limit if total else 1
            }

db = Database()
