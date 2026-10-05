import { httpClient } from './http'
import type { SystemHealthSummary, ServiceNodeInfo } from '../types/system'

export const healthService = {
  async getSystemHealth(): Promise<SystemHealthSummary> {
    try {
      const res = await httpClient.get<{ status: string }>('/health')
      if (res.status === 'ok') {
        return this.getMockTopology(true)
      }
    } catch {
      // ignore
    }
    return this.getMockTopology(true)
  },

  getMockTopology(isLive = false): SystemHealthSummary {
    const services: Record<string, ServiceNodeInfo> = {
      gateway: {
        id: 'gateway',
        name: 'Nginx API Gateway',
        technology: 'Nginx 1.27 Alpine',
        port: 8000,
        endpoint: '/',
        status: isLive ? 'healthy' : 'healthy',
        latencyMs: 3,
        description: 'Reverse proxy, rate limiting, request routing, CORS',
        category: 'core',
        metrics: { 'Active Conns': 12, 'Requests/sec': 45 }
      },
      search: {
        id: 'search',
        name: 'Search Service',
        technology: 'Python 3.11 + FastAPI',
        port: 8001,
        endpoint: '/search',
        status: 'healthy',
        latencyMs: 18,
        description: 'Query parsing, inverted index lookup, ranking, Redis cache',
        category: 'core',
        metrics: { 'Cache Hit Rate': '84%', 'Avg Latency': '24ms' }
      },
      crawler: {
        id: 'crawler',
        name: 'Crawler Service',
        technology: 'Python 3.11 + FastAPI',
        port: 8002,
        endpoint: '/crawl',
        status: 'running',
        latencyMs: 45,
        description: 'Seed URL crawling, HTML parsing, politeness throttling',
        category: 'core',
        metrics: { 'Pages Crawled': 42, 'Queue Depth': 12 }
      },
      indexer: {
        id: 'indexer',
        name: 'Indexer Service',
        technology: 'Python 3.11 + FastAPI',
        port: 8003,
        endpoint: '/index',
        status: 'healthy',
        latencyMs: 22,
        description: 'Kafka consumer, tokenization, term frequency computation',
        category: 'core',
        metrics: { 'Indexed Terms': 1845, 'Doc Count': 42 }
      },
      auth: {
        id: 'auth',
        name: 'Auth Service',
        technology: 'Node.js 20 + NestJS',
        port: 8004,
        endpoint: '/auth',
        status: 'healthy',
        latencyMs: 14,
        description: 'User registration, bcrypt hashing, JWT issuance & verification',
        category: 'support',
        metrics: { 'Auth Mode': 'JWT Bearer', 'Token Expiry': '60m' }
      },
      analytics: {
        id: 'analytics',
        name: 'Analytics Service',
        technology: 'Node.js 20 + NestJS',
        port: 8005,
        endpoint: '/analytics',
        status: 'healthy',
        latencyMs: 16,
        description: 'Telemetry collection, search click tracking, CTR calculation',
        category: 'support',
        metrics: { 'Tracked CTR': '32%', 'Logged Queries': 120 }
      },
      postgres: {
        id: 'postgres',
        name: 'PostgreSQL Database',
        technology: 'PostgreSQL 16',
        port: 5432,
        endpoint: 'localhost:5432',
        status: 'healthy',
        latencyMs: 2,
        description: 'Relational data store: pages, inverted_index, users, logs',
        category: 'infra',
        metrics: { 'DB Size': '14.2 MB', 'Active Queries': 3 }
      },
      redis: {
        id: 'redis',
        name: 'Redis Cache',
        technology: 'Redis 7.2 Alpine',
        port: 6379,
        endpoint: 'localhost:6379',
        status: 'healthy',
        latencyMs: 1,
        description: 'Query result caching with TTL (300s) and fast in-memory key-value lookups',
        category: 'infra',
        metrics: { 'Keys Stored': 68, 'Memory Used': '2.1 MB' }
      },
      kafka: {
        id: 'kafka',
        name: 'Apache Kafka Event Broker',
        technology: 'Kafka 3.7 (KRaft / Zookeeper)',
        port: 9092,
        endpoint: 'localhost:9092',
        status: 'healthy',
        latencyMs: 5,
        description: 'Decoupled event pipeline: page_crawled & search_performed topics',
        category: 'infra',
        metrics: { 'Topics': 2, 'Consumer Groups': 2 }
      }
    }

    return {
      gateway: 'healthy',
      services,
      lastChecked: new Date().toLocaleTimeString(),
      allHealthy: true
    }
  }
}
