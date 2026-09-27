import type { SearchResultItem } from '../types/search'
import type { CrawledPageRecord } from '../types/crawler'
import type { InvertedIndexPostings } from '../types/indexer'
import type { TopQueryItem, SearchLogRecord } from '../types/analytics'
import type { User } from '../types/auth'

export const mockPages: (SearchResultItem & { content: string; wordCount: number })[] = [
  {
    page_id: 1,
    title: 'FastAPI High-Performance Python Web Framework Documentation',
    url: 'https://fastapi.tiangolo.com/tutorial/first-steps/',
    domain: 'fastapi.tiangolo.com',
    snippet: 'FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+ based on standard Python type hints. Built on Starlette and Pydantic for ultra-fast async request handling.',
    score: 98,
    crawled_at: '2026-09-27T08:15:00Z',
    wordCount: 1420,
    term_frequencies: {
      fastapi: 18,
      python: 14,
      async: 9,
      api: 12,
      microservices: 5,
      framework: 8
    },
    content: 'FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints...'
  },
  {
    page_id: 2,
    title: 'NestJS - A progressive Node.js framework for scalable server applications',
    url: 'https://docs.nestjs.com/first-steps',
    domain: 'docs.nestjs.com',
    snippet: 'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. Fully supports TypeScript, dependency injection, and modular architecture.',
    score: 95,
    crawled_at: '2026-09-27T08:18:22Z',
    wordCount: 1680,
    term_frequencies: {
      nestjs: 22,
      node: 11,
      typescript: 15,
      architecture: 7,
      microservices: 9,
      modules: 12
    },
    content: 'NestJS provides an out-of-the-box application architecture which allows developers and teams to create highly testable, scalable, loosely coupled, and easily maintainable applications...'
  },
  {
    page_id: 3,
    title: 'PostgreSQL Inverted Index & Full Text Search Deep Dive',
    url: 'https://www.postgresql.org/docs/current/textsearch.html',
    domain: 'postgresql.org',
    snippet: 'Learn how inverted indexes work internally in PostgreSQL. Indexing terms, tokenization, GIN/GiST index structures, document frequencies, and rapid multi-term queries.',
    score: 91,
    crawled_at: '2026-09-27T08:24:10Z',
    wordCount: 2200,
    term_frequencies: {
      postgresql: 19,
      index: 25,
      inverted: 14,
      search: 18,
      database: 10,
      sql: 8
    },
    content: 'Full text searching in PostgreSQL allows documents to be indexed by terms and queried with ranking algorithms and stemming filters...'
  },
  {
    page_id: 4,
    title: 'Redis Caching Patterns for Ultra-Low Latency Search Engines',
    url: 'https://redis.io/docs/manual/patterns/distributed-caching/',
    domain: 'redis.io',
    snippet: 'Best practices for caching query results, inverted index fragments, and session tokens with Redis TTL, LRU eviction, and sub-millisecond lookups.',
    score: 88,
    crawled_at: '2026-09-27T08:30:45Z',
    wordCount: 1350,
    term_frequencies: {
      redis: 21,
      cache: 19,
      latency: 11,
      performance: 8,
      search: 7
    },
    content: 'Redis is an in-memory data structure store used as a database, cache, and message broker...'
  },
  {
    page_id: 5,
    title: 'Apache Kafka Event-Driven Microservices Architecture',
    url: 'https://kafka.apache.org/documentation/streams/',
    domain: 'kafka.apache.org',
    snippet: 'Building decoupled streaming pipelines with Kafka topics, consumer groups, partitions, and high-throughput event logs connecting crawler and indexer services.',
    score: 86,
    crawled_at: '2026-09-27T08:35:12Z',
    wordCount: 1950,
    term_frequencies: {
      kafka: 26,
      events: 14,
      crawler: 8,
      indexer: 8,
      streaming: 12,
      microservices: 10
    },
    content: 'Apache Kafka is a distributed event streaming platform used by thousands of companies for high-performance data pipelines...'
  },
  {
    page_id: 6,
    title: 'Nginx Reverse Proxy & API Gateway Configuration Guide',
    url: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html',
    domain: 'nginx.org',
    snippet: 'Configure Nginx as a high-throughput API gateway with path routing, rate limiting, SSL termination, upstream load balancing, and access logging.',
    score: 83,
    crawled_at: '2026-09-27T08:40:00Z',
    wordCount: 1100,
    term_frequencies: {
      nginx: 17,
      gateway: 12,
      proxy: 15,
      routing: 9,
      microservices: 6
    },
    content: 'Nginx acts as a single point of entry for microservices, proxying traffic seamlessly based on URL prefix routes...'
  },
  {
    page_id: 7,
    title: 'Building a Custom Web Crawler with Python and AsyncIO',
    url: 'https://realpython.com/async-web-crawler-python/',
    domain: 'realpython.com',
    snippet: 'Comprehensive guide to building polite web crawlers: domain politeness delays, HTML parsing with BeautifulSoup, queue management, and deduplication.',
    score: 80,
    crawled_at: '2026-09-27T08:48:30Z',
    wordCount: 1850,
    term_frequencies: {
      crawler: 24,
      python: 16,
      async: 10,
      scraping: 11,
      links: 8
    },
    content: 'Web crawlers discover and download content from the internet by following hyperlinks systematically across seed domains...'
  },
  {
    page_id: 8,
    title: 'JWT Authentication and Security Best Practices in Microservices',
    url: 'https://auth0.com/blog/json-web-token-jwt-security-best-practices/',
    domain: 'auth0.com',
    snippet: 'Secure microservices communication using JSON Web Tokens (JWT), HMAC-SHA256 signing, token expiration, refresh strategies, and gateway verification.',
    score: 77,
    crawled_at: '2026-09-27T08:52:19Z',
    wordCount: 1540,
    term_frequencies: {
      jwt: 23,
      auth: 18,
      security: 12,
      tokens: 15,
      microservices: 7
    },
    content: 'JSON Web Tokens provide stateless authentication for distributed microservice architectures without requiring database roundtrips...'
  }
]

export const mockCrawledFeed: CrawledPageRecord[] = mockPages.map(p => ({
  id: p.page_id,
  url: p.url,
  title: p.title,
  crawled_at: p.crawled_at || '2026-09-27T08:00:00Z',
  word_count: p.wordCount,
  status_code: 200
}))

export const mockInvertedIndex: InvertedIndexPostings[] = [
  {
    term: 'microservices',
    doc_count: 6,
    occurrences: [
      { page_id: 5, title: 'Apache Kafka Event-Driven Architecture', url: 'https://kafka.apache.org', term_frequency: 10 },
      { page_id: 2, title: 'NestJS Framework Documentation', url: 'https://docs.nestjs.com', term_frequency: 9 },
      { page_id: 8, title: 'JWT Authentication and Security', url: 'https://auth0.com', term_frequency: 7 },
      { page_id: 6, title: 'Nginx Reverse Proxy & API Gateway', url: 'https://nginx.org', term_frequency: 6 },
      { page_id: 1, title: 'FastAPI High-Performance Web Framework', url: 'https://fastapi.tiangolo.com', term_frequency: 5 }
    ]
  },
  {
    term: 'fastapi',
    doc_count: 1,
    occurrences: [
      { page_id: 1, title: 'FastAPI High-Performance Python Web Framework', url: 'https://fastapi.tiangolo.com', term_frequency: 18 }
    ]
  },
  {
    term: 'python',
    doc_count: 2,
    occurrences: [
      { page_id: 7, title: 'Building a Custom Web Crawler with Python', url: 'https://realpython.com', term_frequency: 16 },
      { page_id: 1, title: 'FastAPI High-Performance Python Web Framework', url: 'https://fastapi.tiangolo.com', term_frequency: 14 }
    ]
  },
  {
    term: 'nestjs',
    doc_count: 1,
    occurrences: [
      { page_id: 2, title: 'NestJS Framework Documentation', url: 'https://docs.nestjs.com', term_frequency: 22 }
    ]
  },
  {
    term: 'redis',
    doc_count: 1,
    occurrences: [
      { page_id: 4, title: 'Redis Caching Patterns for Search', url: 'https://redis.io', term_frequency: 21 }
    ]
  },
  {
    term: 'crawler',
    doc_count: 2,
    occurrences: [
      { page_id: 7, title: 'Building a Custom Web Crawler with Python', url: 'https://realpython.com', term_frequency: 24 },
      { page_id: 5, title: 'Apache Kafka Event-Driven Architecture', url: 'https://kafka.apache.org', term_frequency: 8 }
    ]
  },
  {
    term: 'index',
    doc_count: 2,
    occurrences: [
      { page_id: 3, title: 'PostgreSQL Inverted Index & Full Text Search', url: 'https://www.postgresql.org', term_frequency: 25 },
      { page_id: 5, title: 'Apache Kafka Event-Driven Architecture', url: 'https://kafka.apache.org', term_frequency: 8 }
    ]
  }
]

export const mockTopQueries: TopQueryItem[] = [
  { query: 'microservices architecture', count: 142, avg_ctr: 0.38, last_searched: '2 mins ago' },
  { query: 'fastapi vs nestjs', count: 98, avg_ctr: 0.44, last_searched: '5 mins ago' },
  { query: 'inverted index postgresql', count: 85, avg_ctr: 0.31, last_searched: '12 mins ago' },
  { query: 'kafka crawler events', count: 64, avg_ctr: 0.29, last_searched: '20 mins ago' },
  { query: 'redis search caching ttl', count: 52, avg_ctr: 0.41, last_searched: '45 mins ago' },
  { query: 'nginx rate limit gateway', count: 39, avg_ctr: 0.25, last_searched: '1 hour ago' }
]

export const mockSearchLogs: SearchLogRecord[] = [
  { id: 101, query: 'microservices architecture', user_id: 'usr-9281', searched_at: '2026-09-27T10:45:00Z', result_count: 6 },
  { id: 102, query: 'fastapi vs nestjs', user_id: 'usr-9281', searched_at: '2026-09-27T10:48:12Z', result_count: 4 },
  { id: 103, query: 'inverted index', user_id: null, searched_at: '2026-09-27T10:52:30Z', result_count: 5 },
  { id: 104, query: 'redis cache speed', user_id: null, searched_at: '2026-09-27T10:58:05Z', result_count: 3 },
  { id: 105, query: 'kafka consumer group', user_id: 'usr-4412', searched_at: '2026-09-27T11:02:18Z', result_count: 2 }
]

export const mockUser: User = {
  id: 'usr-8b7a42e1-45c9-4cf3-9e12-89218204bb3a',
  email: 'developer@searchengine.internal',
  created_at: '2026-09-15T12:00:00Z'
}
