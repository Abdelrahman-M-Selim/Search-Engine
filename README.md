# Polyglot Search Engine

> High-throughput web crawler, inverted indexer, sub-50ms cached retrieval engine, and event-driven telemetry platform built on distributed microservices.

[![Build Status](https://img.shields.io/github/actions/workflow/status/owner/repo/ci.yml?branch=main&style=flat-square)](.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](#license)
[![Architecture](https://img.shields.io/badge/architecture-event--driven%20microservices-orange?style=flat-square)](#architecture)
[![Python](https://img.shields.io/badge/python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/node.js-20%20%7C%2022-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0+-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-7.6.0-231F20?style=flat-square&logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7--alpine-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
  - [System Architecture Diagram](#system-architecture-diagram)
  - [End-to-End Data Pipeline](#end-to-end-data-pipeline)
  - [Service Boundaries and Responsibilities](#service-boundaries-and-responsibilities)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker Compose (Recommended)](#running-with-docker-compose-recommended)
  - [Running Locally for Development](#running-locally-for-development)
- [Usage and API Reference](#usage-and-api-reference)
  - [API Gateway Routing Summary](#api-gateway-routing-summary)
  - [Search Service Endpoints](#search-service-endpoints)
  - [Crawler Service Endpoints](#crawler-service-endpoints)
  - [Indexer Service Endpoints](#indexer-service-endpoints)
  - [Authentication Service Endpoints](#authentication-service-endpoints)
  - [Analytics Service Endpoints](#analytics-service-endpoints)
- [Testing](#testing)
- [Deployment and CI/CD](#deployment-and-cicd)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author and Contact](#author-and-contact)

---

## Overview

The Polyglot Search Engine is an end-to-end distributed search infrastructure platform designed to handle the complete search lifecycle: asynchronous web discovery, text normalization and inverted index construction, ranked relevance retrieval, low-latency caching, and user click-through analytics.

### The Problem It Solves

Monolithic search architectures tightly couple web crawling, document parsing, and query resolution. Under sudden traffic spikes or heavy scraping workloads, traditional systems experience cascading degradation across their query handling layers. Furthermore, monolithic systems force language compromises between data-intensive tokenization workloads and transactional business logic.

This project solves these architectural bottlenecks by:

- Decoupling ingestion and querying across specialized polyglot microservice boundaries.
- Utilizing Apache Kafka for reliable asynchronous event delivery between crawlers, indexers, and analytics collectors.
- Delivering sub-50ms query response times via an in-memory Redis caching tier with automatic PostgreSQL fallback.
- Providing full observability and management interfaces for index health, crawl queues, database storage, and query analytics.

### Target Audience

- Engineers and systems architects studying real-world distributed microservices patterns.
- Developers implementing custom full-text inverted indexing, asynchronous web crawlers, and event-driven data streaming pipelines.
- Teams seeking a reference implementation combining Python (FastAPI), TypeScript (NestJS), Vue 3, PostgreSQL, Redis, and Apache Kafka behind an Nginx edge gateway.

---

## Key Features

- **Polite Asynchronous Web Crawler:**
  - Concurrent crawling engine powered by Python `httpx` and `asyncio`.
  - Enforces per-domain politeness through asynchronous locking and rate limiting (minimum 1.0-second delay per host).
  - Depth-bounded recursion (`max_depth` parameter) with file extension filtering (rejects binaries, images, documents, and media).
  - Transactional persistence of crawler frontier states (`PENDING`, `PROCESSING`, `DONE`) using PostgreSQL row locks (`SKIP LOCKED`).

- **Custom Inverted Indexing Pipeline:**
  - Stop-word filtration, lowercasing, and regex tokenization.
  - Term frequency calculation and transactional batch upserts (`ON CONFLICT (term, page_id) DO UPDATE`).
  - Asynchronous event consumer processing `page_crawled` Kafka messages with fail-open in-memory fallback.
  - Granular index inspection endpoints exposing posting lists, document frequency metrics, and top indexed terms.

- **Two-Tier Search and Ranking Engine:**
  - Multi-term relevance scoring based on matched term coverage and summed term frequencies.
  - Dynamic snippet generator extracting context windows around matched query terms.
  - Redis query caching tier with automatic cache population and background Kafka event emission (`search_performed`).

- **Authentication and Authorization:**
  - Stateless JSON Web Token (JWT) issuance and validation using NestJS and Passport.
  - Password hashing utilizing `bcrypt` with configurable salt rounds.
  - Protected profile routes and role-ready TypeORM user entities.

- **Search Telemetry and Analytics Engine:**
  - Background event tracking for search queries, execution times, result counts, and user identifiers.
  - Click-through tracking capturing rank position and target document identifiers.
  - Aggregated analytical endpoints delivering top search queries and configurable time-window Click-Through Rates (CTR).

- **Modern Single Page Application (SPA):**
  - Responsive Vue 3 frontend built with Vite and TypeScript.
  - Unified search view with live stats, query history, and result snippet rendering.
  - Operational dashboards for Crawler control, Indexer inspections, Analytics visualizations, and System topology health.
  - System-wide light/dark theme toggle and toast notification framework.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **API Gateway** | Nginx Alpine | Reverse proxy, path routing, CORS headers, gzip compression |
| **Search Engine** | Python 3.12 / FastAPI | Query parsing, relevance scoring, snippet generation, caching |
| **Indexer Service** | Python 3.12 / FastAPI | Kafka consumer, tokenization, term frequency index maintenance |
| **Crawler Service** | Python 3.12 / FastAPI | Asynchronous web scraping, politeness locking, frontier queuing |
| **Auth Service** | Node.js 20+ / NestJS 11 | User registration, bcrypt password hashing, JWT authentication |
| **Analytics Service** | Node.js 20+ / NestJS 11 | Search and click event logging, top query and CTR aggregation |
| **Frontend UI** | Vue 3 / Vite / TypeScript | Interactive search interface and microservice operations console |
| **Primary Database** | PostgreSQL 16 Alpine | Relational storage for users, frontier, pages, index, and logs |
| **Cache Layer** | Redis 7 Alpine | Low-latency response caching for repeated search queries |
| **Message Broker** | Apache Kafka 7.6.0 | Distributed event streaming (`page_crawled`, `search_performed`) |
| **Coordination** | Apache ZooKeeper 7.6.0 | Cluster metadata management for Kafka broker |
| **Containerization** | Docker / Docker Compose | Multi-container environment orchestration and service networking |
| **Administration UIs** | pgAdmin 4 / Redis Commander | Web-based management for database and caching instances |

---

## Architecture

### System Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer["Client Layer"]
        UI["Vue 3 SPA<br/>(TypeScript / Vite)"]
        ExternalClient["External REST API Client"]
    end

    subgraph GatewayLayer["Edge Gateway"]
        Nginx["Nginx API Gateway (Port 8000)<br/>• Reverse Proxy • CORS Headers • Path Routing"]
    end

    subgraph CoreServices["Microservices Ecosystem"]
        direction TB
        SearchSvc["Search Service<br/>(FastAPI / Python 3.12)"]
        IndexerSvc["Indexer Service<br/>(FastAPI / Python 3.12)"]
        CrawlerSvc["Crawler Service<br/>(FastAPI / Python 3.12)"]
        AuthSvc["Auth Service<br/>(NestJS / TypeScript)"]
        AnalyticsSvc["Analytics Service<br/>(NestJS / TypeScript)"]
    end

    subgraph MessageBus["Event Streaming Broker"]
        Kafka["Apache Kafka Broker<br/>• Topics: page_crawled, search_performed, result_clicked"]
        ZK["Apache ZooKeeper"]
        Kafka --- ZK
    end

    subgraph StorageLayer["Data & Persistence Tier"]
        Postgres[("PostgreSQL 16 Database<br/>• pages • inverted_index<br/>• crawler_frontier • users<br/>• search_logs • click_logs")]
        RedisCache[("Redis 7 Cache<br/>• Query Results")]
    end

    UI --> Nginx
    ExternalClient --> Nginx

    Nginx -->|/search| SearchSvc
    Nginx -->|/crawl/| CrawlerSvc
    Nginx -->|/index/| IndexerSvc
    Nginx -->|/auth/| AuthSvc
    Nginx -->|/analytics/| AnalyticsSvc

    CrawlerSvc -->|Publish: page_crawled| Kafka
    CrawlerSvc -->|Read/Write Pages & Frontier| Postgres

    Kafka -->|Consume: page_crawled| IndexerSvc
    IndexerSvc -->|Upsert Inverted Index| Postgres

    SearchSvc -->|1. Check / Write Cache| RedisCache
    SearchSvc -->|2. Query Inverted Index| Postgres
    SearchSvc -->|Publish: search_performed| Kafka

    AuthSvc -->|User Authentication & State| Postgres

    AnalyticsSvc -->|Read/Write Telemetry Logs| Postgres
    Kafka -.->|Event Feed| AnalyticsSvc
```

### End-to-End Data Pipeline

```
[Target Web Pages]
       │
       │ (Async HTTP GET via httpx + BeautifulSoup)
       ▼
[crawler-service] ───────────(Persist Raw HTML & Title)───────────► [PostgreSQL: pages]
       │
       └──────────────(Publish page_id & metadata)────────────────► [Kafka: page_crawled]
                                                                            │
                                                                            ▼
                                                                    [indexer-service]
                                                                            │
                                                       (Tokenize, Filter Stopwords, Count TF)
                                                                            │
                                                                            ▼
                                                                [PostgreSQL: inverted_index]
                                                                            │
[Client Query: "database engine"]                                            │
       │                                                                    │
       ▼                                                                    │
[Nginx Gateway]                                                             │
       │                                                                    │
       ▼                                                                    │
[search-service] ──────────(Cache Miss: Match Terms & Sum Scores)───────────┘
       │                                                                    │
       ├───────────────────(Write Query Result Cache)─────────────────────► [Redis Cache]
       │
       └───────────────────(Publish Search Event)─────────────────────────► [Kafka: search_performed]
                                                                                    │
                                                                                    ▼
                                                                          [analytics-service]
```

### Service Boundaries and Responsibilities

- **gateway (Nginx):** Terminates external HTTP traffic on port `8000`. Directs requests based on URI prefixes (`/search`, `/crawl/`, `/index/`, `/auth/`, `/analytics/`, `/health`), injects unified CORS headers, and applies gzip compression.
- **search-service (FastAPI):** Validates incoming query strings, verifies cache availability in Redis, executes inverted index lookups in PostgreSQL, scores and ranks matching documents, generates contextual text snippets, and triggers asynchronous analytics publishing.
- **indexer-service (FastAPI):** Subscribes to the `page_crawled` Kafka topic, executes stopword filtering and tokenization routines, calculates term frequencies, and maintains relational inverted index records with transactional safety.
- **crawler-service (FastAPI):** Manages frontier URLs, crawls web pages asynchronously, enforces host-level rate limiting, extracts child hyperlinks, saves parsed page content to PostgreSQL, and broadcasts ingestion notifications to Kafka.
- **auth-service (NestJS):** Handles user account creation, credentials validation via `bcrypt`, and cryptographically signed JWT generation for protected application endpoints.
- **analytics-service (NestJS):** Ingests search queries and user click telemetry, aggregates query frequencies, and evaluates click-through performance across customizable analytical time windows.
- **ui (Vue 3):** Single-page web client providing search input, query autocompletion/history, crawler seeding controls, index postings browser, analytics dashboards, and live system health inspection.

---

## Project Structure

```
Search-Engine/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions automated build and verification pipeline
├── analytics-service/             # NestJS microservice for search and click telemetry
│   ├── src/
│   │   ├── analytics/             # Controllers, services, DTOs, and TypeORM entities
│   │   ├── config/                # Environment variable configuration providers
│   │   ├── app.module.ts          # Root dependency injection module
│   │   └── main.ts                # Application bootstrap with Swagger documentation
│   ├── Dockerfile                 # Container build specification for Analytics Service
│   └── package.json               # Node.js dependencies and scripts
├── auth-service/                  # NestJS microservice for user identity and JWT issuance
│   ├── src/
│   │   ├── auth/                  # Authentication strategies, guards, DTOs, and controllers
│   │   ├── users/                 # User entity definitions and database access modules
│   │   ├── config/                # Auth service runtime configurations
│   │   ├── app.module.ts          # Main application module wiring TypeORM and Passport
│   │   └── main.ts                # Service entry point configuring Swagger and pipes
│   ├── Dockerfile                 # Container build specification for Auth Service
│   └── package.json               # Dependencies and scripts for authentication engine
├── crawler-service/               # FastAPI asynchronous web crawling microservice
│   ├── app/
│   │   ├── config.py              # Pydantic settings for crawler concurrency and limits
│   │   ├── crawler_engine.py      # Core scraping engine, politeness locks, and link extractor
│   │   ├── database.py            # PostgreSQL asyncpg client for crawler frontier and pages
│   │   ├── kafka_producer.py      # Asynchronous Kafka event publisher for crawled pages
│   │   ├── main.py                # FastAPI endpoints for seed ingestion and crawler status
│   │   └── schemas.py             # Pydantic request and response models
│   ├── Dockerfile                 # Container build definition for Crawler Service
│   └── requirements.txt           # Python package dependencies
├── docs/                          # Architecture design documents and engineering roadmaps
│   ├── search-engine-project-plan.md     # Step-by-step implementation plan and milestones
│   └── search-engine-system-design.md    # Exhaustive system architecture specification
├── gateway/                       # Nginx edge reverse proxy
│   ├── cors.conf                  # Cross-Origin Resource Sharing configuration directives
│   ├── Dockerfile                 # Alpine-based Nginx container definition
│   └── nginx.conf                 # Upstream load balancing and location routing rules
├── indexer-service/               # FastAPI inverted index processor and event worker
│   ├── app/
│   │   ├── config.py              # Configuration for database and Kafka consumer groups
│   │   ├── consumer.py            # Asynchronous Kafka consumer processing crawled pages
│   │   ├── indexer.py             # Database transaction engine for inverted index upserts
│   │   ├── main.py                # FastAPI lifecycle manager and entry point
│   │   ├── routes.py              # Endpoints for manual indexing and term inspection
│   │   ├── schemas.py             # Pydantic validation schemas
│   │   └── tokenizer.py           # Stopword filtration and term frequency counter
│   ├── Dockerfile                 # Container specification for Indexer Service
│   └── requirements.txt           # Python package dependencies
├── search-service/                # FastAPI search query, ranking, and caching engine
│   ├── app/
│   │   ├── cache.py               # Redis connection pool and key-value caching helper
│   │   ├── config.py              # Search engine settings and environment mapping
│   │   ├── db.py                  # Inverted index querying and contextual snippet extractor
│   │   ├── kafka_producer.py      # Background event producer for search operations
│   │   ├── main.py                # Application entry point with async connection pools
│   │   ├── routes.py              # Query endpoint with cache-aside resolution
│   │   ├── schemas.py             # Search response and health check schemas
│   │   └── tokenizer.py           # Text query sanitizer and tokenizer
│   ├── Dockerfile                 # Container specification for Search Service
│   └── requirements.txt           # Python package dependencies
├── ui/                            # Vue 3 single page web application
│   ├── src/
│   │   ├── assets/                # Global styles, variables, and typography
│   │   ├── components/            # Modular UI components (Search, Crawler, Indexer, Analytics)
│   │   ├── composables/           # Vue 3 reactive composables for state and API calls
│   │   ├── services/              # HTTP clients and API gateway communication layer
│   │   ├── types/                 # TypeScript interfaces and entity contracts
│   │   ├── views/                 # Top-level view router pages
│   │   ├── App.vue                # Root application template
│   │   └── main.ts                # Frontend entry point
│   ├── index.html                 # Single page application HTML template
│   ├── package.json               # Frontend dependencies and Vite build scripts
│   └── vite.config.ts             # Vite development server and plugin configuration
├── .env.example                   # Baseline environment variables template
├── docker-compose.yml             # Production multi-container orchestrator configuration
├── docker-compose.dev.yml         # Development infrastructure orchestrator (database, cache, broker)
└── README.md                      # Primary project documentation
```

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your host system:

- **Docker Engine:** Version 24.0.0 or higher
- **Docker Compose:** Version 2.20.0 or higher
- **Git:** Version 2.30.0 or higher
- *(Optional for standalone local execution)*:
  - Python 3.12+
  - Node.js 20+ or 22+ (LTS)
  - npm 10+

### Environment Variables

Copy the provided environment template into `.env` at the root of the project:

```bash
cp .env.example .env
```

| Variable Name | Description | Default / Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@postgres:5432/search_engine` |
| `REDIS_URL` | Redis cache connection string | `redis://redis:6379/0` |
| `KAFKA_BROKER` | Kafka bootstrap broker address | `kafka:9092` |
| `JWT_SECRET` | Cryptographic secret key for signing auth tokens | `change_this_secret_in_production_key_12345` |
| `JWT_EXPIRE_MINUTES`| Validity duration of issued JWT tokens in minutes | `60` |
| `PAGE_CRAWLED_TOPIC`| Kafka topic for crawled page ingestion notifications | `page_crawled` |
| `SEARCH_PERFORMED_TOPIC` | Kafka topic for user search execution events | `search_performed` |
| `RESULT_CLICKED_TOPIC` | Kafka topic for search result click events | `result_clicked` |
| `POSTGRES_USER` | PostgreSQL superuser username | `user` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `password` |
| `POSTGRES_DB` | PostgreSQL default database name | `search_engine` |
| `POSTGRES_PORT` | Host exposed port for PostgreSQL | `5432` |
| `REDIS_PORT` | Host exposed port for Redis | `6379` |
| `PGADMIN_PORT` | Host exposed port for pgAdmin Web UI | `5050` |
| `REDIS_COMMANDER_PORT` | Host exposed port for Redis Commander UI | `8081` |

---

### Running with Docker Compose (Recommended)

To build and start all 5 microservices, the Nginx gateway, database, cache, broker, and admin tools in a single command:

```bash
docker compose up --build -d
```

Verify that all service containers are running and healthy:

```bash
docker compose ps
```

Once running, access the services on the following host endpoints:

- **Web UI & API Gateway:** `http://localhost:8000`
- **pgAdmin Database Console:** `http://localhost:5050` (Login: `admin@search.com` / `admin`)
- **Redis Commander Console:** `http://localhost:8081`

To stop all containers and preserve database volumes:

```bash
docker compose down
```

---

### Running Locally for Development

For active development, run the shared backing infrastructure (Postgres, Redis, Kafka, Zookeeper, Kafka UI) using the dedicated development compose file:

```bash
docker compose -f docker-compose.dev.yml up -d
```

This exposes:
- PostgreSQL on `localhost:5435`
- Redis on `localhost:6380`
- Kafka Broker on `localhost:9092`
- Kafka UI on `http://localhost:8085`
- pgAdmin on `http://localhost:5051`
- Redis Commander on `http://localhost:8081`

Next, run each service locally in its own terminal session:

#### 1. Search Service (Python / FastAPI)

```bash
cd search-service
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost:5435/search_engine"
export REDIS_URL="redis://localhost:6380/0"
export KAFKA_BROKER="localhost:9092"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Indexer Service (Python / FastAPI)

```bash
cd indexer-service
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost:5435/search_engine"
export KAFKA_BROKER="localhost:9092"

uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

#### 3. Crawler Service (Python / FastAPI)

```bash
cd crawler-service
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@localhost:5435/search_engine"
export KAFKA_BROKER="localhost:9092"

uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### 4. Auth Service (Node.js / NestJS)

```bash
cd auth-service
npm install
export DATABASE_URL="postgresql://user:password@localhost:5435/search_engine"
export JWT_SECRET="dev_secret_key"

npm run start:dev
```

#### 5. Analytics Service (Node.js / NestJS)

```bash
cd analytics-service
npm install
export DATABASE_URL="postgresql://user:password@localhost:5435/search_engine"
export KAFKA_BROKER="localhost:9092"

npm run start:dev
```

#### 6. Frontend UI (Vue 3 / Vite)

```bash
cd ui
npm install
npm run dev
```

The frontend development server will launch at `http://localhost:5173`.

---

## Usage and API Reference

### API Gateway Routing Summary

All requests can be routed through the Nginx Edge Gateway (`http://localhost:8000`):

| Gateway Path | Target Microservice | Internal Port | Description |
|---|---|---|---|
| `/search` | `search-service` | `8000` | Full-text query resolution and ranking |
| `/crawl/*` | `crawler-service` | `8000` | Crawler frontier and status management |
| `/index/*` | `indexer-service` | `8000` | Inverted index operations and term statistics |
| `/auth/*` | `auth-service` | `3000` | User account registration and authentication |
| `/analytics/*` | `analytics-service` | `3001` | Query and click event telemetry |
| `/health` | Gateway Inline | N/A | Gateway health status check |

---

### Search Service Endpoints

#### Execute a Search Query

```http
GET /search?q=computer+science&page=1&limit=10
Host: localhost:8000
```

Sample JSON Response:

```json
{
  "query": "computer science",
  "total_results": 42,
  "page": 1,
  "limit": 10,
  "results": [
    {
      "page_id": 105,
      "title": "Introduction to Computer Science",
      "url": "https://en.wikipedia.org/wiki/Computer_science",
      "snippet": "...Computer science is the study of computation, information, and automation. Computer science spans theoretical disciplines to practical applications..."
    }
  ]
}
```

---

### Crawler Service Endpoints

#### Add Seed URL

```http
POST /crawl/seed
Host: localhost:8000
Content-Type: application/json

{
  "url": "https://en.wikipedia.org/wiki/Distributed_computing"
}
```

Sample JSON Response:

```json
{
  "status": "seed added",
  "url": "https://en.wikipedia.org/wiki/Distributed_computing"
}
```

#### Check Crawler Status

```http
GET /crawl/status
Host: localhost:8000
```

Sample JSON Response:

```json
{
  "pages_crawled": 158,
  "in_progress": true
}
```

#### Stop Crawler Execution

```http
POST /crawl/stop
Host: localhost:8000
```

---

### Indexer Service Endpoints

#### Check Indexer Status and Statistics

```http
GET /index/status
Host: localhost:8000
```

Sample JSON Response:

```json
{
  "service": "indexer-service",
  "status": "online",
  "total_indexed_pages": 158,
  "total_unique_terms": 14205,
  "database_connected": true,
  "kafka_connected": true
}
```

#### Inspect Top Indexed Terms

```http
GET /index/terms?page=1&limit=5
Host: localhost:8000
```

Sample JSON Response:

```json
{
  "items": [
    { "term": "distributed", "doc_count": 87 },
    { "term": "systems", "doc_count": 79 },
    { "term": "computing", "doc_count": 65 },
    { "term": "database", "doc_count": 54 },
    { "term": "network", "doc_count": 48 }
  ],
  "total": 14205,
  "page": 1,
  "size": 5,
  "total_pages": 2841
}
```

#### Manual Text Tokenization

```http
POST /index/tokenize
Host: localhost:8000
Content-Type: application/json

{
  "text": "The distributed systems architecture provides fault tolerance."
}
```

Sample JSON Response:

```json
{
  "raw_text": "The distributed systems architecture provides fault tolerance.",
  "token_count": 5,
  "unique_terms_count": 5,
  "tokens": ["distributed", "systems", "architecture", "provides", "fault", "tolerance"],
  "term_frequencies": {
    "distributed": 1,
    "systems": 1,
    "architecture": 1,
    "provides": 1,
    "fault": 1,
    "tolerance": 1
  }
}
```

---

### Authentication Service Endpoints

#### Register User

```http
POST /auth/register
Host: localhost:8000
Content-Type: application/json

{
  "email": "engineer@search.local",
  "password": "SecurePassword123!"
}
```

#### Login User

```http
POST /auth/login
Host: localhost:8000
Content-Type: application/json

{
  "email": "engineer@search.local",
  "password": "SecurePassword123!"
}
```

Sample JSON Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Analytics Service Endpoints

#### Retrieve Top Searched Queries

```http
GET /analytics/top-queries
Host: localhost:8000
```

Sample JSON Response:

```json
[
  { "query": "distributed systems", "count": "142" },
  { "query": "fastapi indexing", "count": "89" },
  { "query": "kafka microservices", "count": "61" }
]
```

#### Query Click-Through Rate (CTR)

```http
GET /analytics/click-through-rate?window=7d
Host: localhost:8000
```

Sample JSON Response:

```json
{
  "ctr": 0.4285,
  "window": "7d"
}
```

---

## Testing

### Frontend Type Checking and Build Verification

Run TypeScript compilation and static verification for the Vue 3 user interface:

```bash
cd ui
npm run type-check
npm run build-only
```

### Python Services Static Verification

Test syntax validity across all Python FastAPI services using the local interpreter:

```bash
python -m py_compile search-service/app/*.py
python -m py_compile indexer-service/app/*.py
python -m py_compile crawler-service/app/*.py
```

### NestJS Services Compilation

Verify TypeScript builds for both Auth and Analytics microservices:

```bash
cd auth-service && npm run build
cd ../analytics-service && npm run build
```

---

## Deployment and CI/CD

### Containerized Deployment

All services are containerized via standardized multi-stage Dockerfiles. Build artifacts are orchestrated via Docker Compose:

- Every microservice runs in an isolated network environment (`search_network`).
- Health checks ensure PostgreSQL and Redis dependencies are operational before services bootstrap.
- Data volumes (`postgres_data`, `redis_data`) guarantee persistence across container restarts.

### Continuous Integration (GitHub Actions)

The repository includes a GitHub Actions CI pipeline configured at `.github/workflows/ci.yml`. On every push or pull request to the `main` branch, the pipeline executes the following checks:

1. **Docker Container Builds:** Validates build integrity for `auth-service`, `analytics-service`, `crawler-service`, and `gateway`.
2. **Compose Validation:** Verifies the syntax and dependency graph of `docker-compose.yml` using `docker compose config`.

---

## Roadmap

The following planned enhancements are derived from code annotations and architectural milestones:

- [ ] **Advanced Relevance Algorithms:** Implement TF-IDF (Term Frequency-Inverse Document Frequency) and Okapi BM25 scoring inside the Search and Indexer services.
- [ ] **Crawler Robots.txt Compliance:** Add strict parsing and caching of `robots.txt` directives and sitemap extraction to `crawler-service`.
- [ ] **Distributed Crawler Workers:** Implement distributed frontier partitioning with Redis-backed distributed locks to support multi-node crawler instances.
- [ ] **Automated Test Suites:** Implement unit and integration test suites using `pytest` (Python services) and `Jest` / `Supertest` (NestJS services).
- [ ] **Authentication Refresh Tokens:** Support rolling refresh tokens and token revocation lists in `auth-service`.
- [ ] **Dedicated Kafka Consumers for Analytics:** Transition the `analytics-service` from REST-based logging to direct Kafka topic stream consumption for `search_performed` and `result_clicked`.
- [ ] **Elasticsearch / OpenSearch Optional Adapter:** Introduce a pluggable interface allowing indexers to stream to an external search cluster.

---

## Contributing

Contributions are welcomed. Follow this standard workflow:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit Your Changes:** Follow clear, descriptive commit messages.
   ```bash
   git commit -m "feat(search-service): add BM25 ranking calculation"
   ```
4. **Push to Your Fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request:** Detail the changes made, background context, and steps to test.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details (or replace with your organization's standard license).

---

## Author and Contact

- **Author:** [Your Name / Organization]
- **Repository:** [https://github.com/your-username/Search-Engine](https://github.com/your-username/Search-Engine)
- **Issue Tracker:** [https://github.com/your-username/Search-Engine/issues](https://github.com/your-username/Search-Engine/issues)
- **Contact:** `admin@search.local`
