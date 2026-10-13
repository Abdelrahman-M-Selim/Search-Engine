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

## Contributors

- [Abdelrahman Selim](https://github.com/Abdelrahman-M-Selim)
- [Abdelrahman Elaraby](https://github.com/aelaraby6)


