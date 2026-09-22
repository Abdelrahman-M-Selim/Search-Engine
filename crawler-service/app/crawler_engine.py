import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from app.config import settings
from app.database import db
from app.kafka_producer import kafka_client

import time

class CrawlerEngine:
    def __init__(self):
        self.running = False
        self.client = None
        self.domain_locks = {}
        self.domain_last_crawl = {}

    async def _get_domain_lock(self, domain: str):
        if domain not in self.domain_locks:
            self.domain_locks[domain] = asyncio.Lock()
        return self.domain_locks[domain]

    async def start(self):
        self.running = True
        self.client = httpx.AsyncClient(timeout=10.0, follow_redirects=True)
        asyncio.create_task(self._worker_loop())

    async def stop(self):
        self.running = False
        if self.client:
            await self.client.aclose()

    async def _worker_loop(self):
        while self.running:
            urls = await db.pop_urls(settings.crawl_concurrency)
            if not urls:
                await asyncio.sleep(2)
                continue
            
            tasks = [self._crawl_url(record['url'], record['depth']) for record in urls]
            await asyncio.gather(*tasks)

    async def _crawl_url(self, url: str, depth: int):
        base_domain = urlparse(url).netloc
        lock = await self._get_domain_lock(base_domain)
        
        async with lock:
            last_crawl = self.domain_last_crawl.get(base_domain, 0)
            now = time.time()
            if now - last_crawl < 1.0:
                await asyncio.sleep(1.0 - (now - last_crawl))
            self.domain_last_crawl[base_domain] = time.time()

        try:
            response = await self.client.get(url)
            if response.status_code != 200:
                return
            
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type:
                return

            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            title_tag = soup.find('title')
            title = title_tag.text.strip() if title_tag else ""
            
            text_content = soup.get_text(separator=' ', strip=True)
            
            page_id = await db.save_page(url, title, text_content)
            await kafka_client.send_crawled_page(page_id, url)
            
            if depth < settings.max_depth:
                new_urls = set()
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(url, href)
                    parsed_full = urlparse(full_url)
                    if parsed_full.scheme in ('http', 'https') and parsed_full.netloc == base_domain:
                        clean_url = f"{parsed_full.scheme}://{parsed_full.netloc}{parsed_full.path}"
                        new_urls.add((clean_url, depth + 1))
                
                if new_urls:
                    await db.add_urls(list(new_urls))
                    
        except Exception:
            pass
        finally:
            await db.mark_done(url)

crawler = CrawlerEngine()
