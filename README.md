# Search Engine — Distributed Microservices

A distributed, polyglot search engine engineered around an event-driven microservices architecture. Designed for high throughput crawling, inverted index construction, sub-50ms cached query retrieval, and real-time analytics aggregation.

---

## Architectural Blueprint

```
+--------------------------------------------------------------------------+
|                            Client (Browser / UI)                         |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                           Nginx API Gateway                              |
|          [Reverse Proxy • Path Routing • Rate Limiting • CORS]           |
+--------------------------------------------------------------------------+
         |                     |                    |                |
         | /search             | /auth              | /analytics     | /crawl & /index
         v                     v                    v                v
+------------------+  +------------------+  +---------------+  +------------------+
|  Search Service  |  |   Auth Service   |  |   Analytics   |  | Crawler / Indexer|
| (Python/FastAPI) |  |  (Node.js/Nest)  |  | (Node.js/Nest)|  | (Python/FastAPI) |
+------------------+  +------------------+  +---------------+  +------------------+
    |          |               |                    |            |             |
    v          v               v                    v            v             v
[ Redis ]  [                         PostgreSQL Primary Database                ]
 (Cache)   [            (users, pages, inverted_index, search_logs)             ]
                   ^                                             ^
                   |                                             |
                   +================ Kafka Broker ===============+
                          [page_crawled • search_performed]
```

---

## Core Engineering Pillars

### 1. Inverted Index Engine
Text tokenization pipeline with stop-word filtration, term frequency calculation, and transactional upserts into PostgreSQL, enabling fast full-text lookup without external search appliances.

### 2. Event-Driven Decoupling
Asynchronous communication mediated by Apache Kafka. Crawlers stream page ingestion events to Indexers, and search operations fire real-time analytics events without introducing request latency.

### 3. Fail-Open Cache Topology
Two-tier query resolution using Redis for sub-50ms responses. Automatic fallback to raw index scanning if cache or broker instances experience degraded availability.

### 4. Polyglot Service Boundary
Specialized language allocation: Python (FastAPI) handles data-intensive tokenization, crawling, and ranking algorithms, while Node.js (NestJS) handles relational auth and transactional logging workflows.

---

## System Topology & Service Directory

| Service | Runtime | Transport | Responsibility |
|---|---|---|---|
| **gateway** | Nginx Alpine | HTTP / Reverse Proxy | Edge routing, TLS termination, client rate limiting |
| **search-service** | Python 3.12 / FastAPI | REST + Redis + Kafka | Query parsing, scoring, ranking, multi-tier caching |
| **indexer-service** | Python 3.12 / FastAPI | Kafka Consumer + asyncpg | Stream processing, tokenization, index maintenance |
| **crawler-service** | Python 3.12 / FastAPI | Async HTTP + Kafka | Politeness-governed web scraping, link queueing |
| **auth-service** | Node 20 / NestJS | REST + TypeORM | RBAC, user state, cryptographically signed JWTs |
| **analytics-service** | Node 20 / NestJS | REST + Kafka Consumer | Search metrics, click telemetry, CTR aggregates |

---

## End-to-End Data Pipeline

```
[Target Web]
     │ (Async Fetch)
     ▼
[crawler-service] ──(Persist Page)──► [PostgreSQL: pages]
     │
     └──(Publish Event)──► [Kafka Topic: page_crawled]
                                   │
                                   ▼
                           [indexer-service] ──(Tokenize & Upsert)──► [PostgreSQL: inverted_index]
                                                                             │
                                                                             ▼
[Client Query] ──► [Nginx] ──► [search-service] ──(Lookup / Score)───────────┤
                                      │                                      │
                               (Cache Miss/Hit)                              │
                                      ▼                                      ▼
                                [Redis Cache] ◄────────(Cache Write)─────────┘
```

---

## Repository Hierarchy

```
Search-Engine/
├── gateway/               # Nginx reverse proxy configuration & routing tables
├── search-service/        # High-performance search & ranking engine
├── indexer-service/       # Inverted index builder & Kafka event worker
├── crawler-service/       # Asynchronous web crawler & link extractor
├── auth-service/          # Enterprise authentication & token provider
├── analytics-service/     # Telemetry, click logs & aggregation service
├── frontend/              # Minimalist search user interface
├── docs/                  # System design specifications & development plans
├── .env.example           # Unified environment variable template
├── docker-compose.yml     # Complete container orchestrator
└── README.md              # Project documentation
```

---

## Getting Started

### 1. Environment Setup
Create the root environment configuration:
```bash
cp .env.example .env
```

### 2. Standalone Service Execution (Local Development)

#### Search Service
```powershell
cd search-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Indexer Service
```powershell
cd indexer-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Detailed Specifications
- [Full System Design Document](docs/search-engine-system-design.md)
- [Step-by-Step Project Roadmap](docs/search-engine-project-plan.md)
- [Search Service Implementation Guide](search-service/README.md)
- [Indexer Service Implementation Guide](indexer-service/README.md)
