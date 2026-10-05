import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from app.config import settings
from app.database import db
from app.kafka_producer import kafka_client

import time
import re
import logging

logger = logging.getLogger("crawler-service")

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
        headers = {
            "User-Agent": "SearchEngineBot/1.0 (Educational Search Engine; contact: admin@search.local)"
        }
        self.client = httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=headers)
        asyncio.create_task(self._worker_loop())

    async def stop(self):
        self.running = False
        if self.client:
            await self.client.aclose()

    async def _worker_loop(self):
        while self.running:
            try:
                urls = await db.pop_urls(settings.crawl_concurrency)
                if not urls:
                    await asyncio.sleep(2)
                    continue
                
                tasks = [self._crawl_url(record['url'], record['depth']) for record in urls]
                await asyncio.gather(*tasks)
            except Exception as e:
                logger.error(f"Error in worker loop: {e}", exc_info=True)
                await asyncio.sleep(2)

    def _is_valid_url(self, path: str) -> bool:
        path = path.lower()
        if re.search(r'\.(jpg|jpeg|png|gif|bmp|svg|webp|ico|mp4|webm|mp3|wav|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|tar|gz|rar|exe|dll|bin|iso|css|js|xml|json|csv)$', path):
            return False
        if re.search(r'^/wiki/(file|talk|special|wikipedia|help|user|template|category|portal|draft|module):', path):
            return False
        return True

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
                logger.warning(f"Failed to fetch {url} (status: {response.status_code})")
                return
            
            content_type = response.headers.get('content-type', '')
            if 'text/html' not in content_type:
                logger.info(f"Skipping non-html {url} (content-type: {content_type})")
                return

            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            title_tag = soup.find('title')
            title = title_tag.text.strip() if title_tag else ""
            
            text_content = soup.get_text(separator=' ', strip=True)
            
            page_id = await db.save_page(url, title, text_content)
            await kafka_client.send_crawled_page(page_id, url)
            logger.info(f"Crawled successfully: {url} (page_id: {page_id})")
            
            if depth < settings.max_depth:
                new_urls = set()
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(url, href)
                    parsed_full = urlparse(full_url)
                    if parsed_full.scheme in ('http', 'https') and parsed_full.netloc == base_domain:
                        if self._is_valid_url(parsed_full.path):
                            clean_url = f"{parsed_full.scheme}://{parsed_full.netloc}{parsed_full.path}"
                            new_urls.add((clean_url, depth + 1))
                
                if new_urls:
                    await db.add_urls(list(new_urls))
                    logger.info(f"Discovered {len(new_urls)} new URLs from {url}")
                    
        except Exception as exc:
            logger.error(f"Error crawling {url}: {exc}")
        finally:
            await db.mark_done(url)

crawler = CrawlerEngine()
