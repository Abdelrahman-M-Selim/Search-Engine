# Search Engine Microservices — System Design

## Table of Contents

1. Overview
2. Requirements
3. High-Level Architecture
4. Service Breakdown
5. Data Flow Diagrams
6. API Contracts
7. Data Model
8. Caching Strategy
9. Messaging / Kafka Design
10. Authentication & Authorization
11. Gateway Design (Nginx)
12. Deployment View
13. Configuration & Environment
14. Error Handling & Resilience
15. Observability (Logging, Metrics, Tracing)
16. Security Considerations
17. Scalability & Performance
18. Failure Scenarios & Mitigations
19. Testing Strategy
20. Key Design Decisions & Trade-offs
21. Future Enhancements
22. Glossary

---

## 1. Overview

This document describes the complete system design of a simplified search engine built with a polyglot microservices architecture. It is meant to be exhaustive: it covers not just the happy path, but also configuration, failure modes, security, and scaling concerns, so it can serve as the single reference for building, reviewing, or extending the system.

**Purpose of the project:**
- Learn how independent services communicate synchronously (HTTP) and asynchronously (Kafka).
- Learn how a basic search engine works end to end: crawling → indexing → searching → ranking.
- Practice running a polyglot stack (Python/FastAPI + Node.js/NestJS) behind a single gateway, backed by shared infrastructure (PostgreSQL, Redis, Kafka).

**Explicit goals:**
- Functional, working MVP with 5 independent services + 1 gateway.
- Clear separation of concerns per service.
- Realistic, production-inspired patterns (JWT auth, event-driven indexing, caching, reverse proxy) at a small, learnable scale.

**Explicit non-goals (for the MVP):**
- Production-grade ranking (TF-IDF/BM25 are optional enhancements, not MVP requirements).
- Horizontal scaling, sharding, replication, or high availability — this is a learning project, not a production search engine.
- Distributed transactions across services — consistency is handled per-service, with Kafka providing eventual consistency between them.
- Full-text search engines like Elasticsearch/Solr — the inverted index is hand-built on top of PostgreSQL intentionally, as a learning exercise.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | A user can submit a search query and receive ranked results with title, URL, and snippet |
| FR-2 | The system can crawl a seed list of URLs and store their content |
| FR-3 | Crawled content is tokenized and added to a searchable inverted index |
| FR-4 | A user can register with an email/password and log in to receive a JWT |
| FR-5 | Authenticated requests can access protected endpoints (e.g. `/auth/me`) |
| FR-6 | Every search is logged; every click on a result can optionally be logged |
| FR-7 | Aggregated analytics (top queries, click-through rate) are queryable |
| FR-8 | Search results are paginated |
| FR-9 | Repeated identical searches are served from cache when possible |

### 2.2 Non-Functional Requirements

| ID | Requirement | Target (MVP scale) |
|---|---|---|
| NFR-1 | Search latency (cache hit) | < 50ms |
| NFR-2 | Search latency (cache miss) | < 500ms for a small index (≤ a few thousand pages) |
| NFR-3 | Crawl politeness | ≥ 1s delay between requests to the same domain |
| NFR-4 | Availability | Best-effort; no HA requirement for MVP |
| NFR-5 | Data durability | PostgreSQL is the source of truth; Redis is disposable cache |
| NFR-6 | Security | Passwords hashed (bcrypt), JWT-signed sessions, no secrets in source control |
| NFR-7 | Observability | Every service logs requests/errors; gateway logs all external traffic |
| NFR-8 | Portability | Entire stack runs via `docker compose up` with no manual setup beyond `.env` |

---

## 3. High-Level Architecture

```mermaid
flowchart TB
    Client["Browser / Frontend"]
    Gateway["Nginx Gateway<br/>(reverse proxy, routing,<br/>rate limiting, CORS, logging)"]

    subgraph Python["Python + FastAPI services"]
        Search["Search Service"]
        Crawler["Crawler Service"]
        Indexer["Indexer Service"]
    end

    subgraph Node["Node.js + NestJS services"]
        Auth["Auth Service"]
        Analytics["Analytics Service"]
    end

    PG[("PostgreSQL")]
    Redis[("Redis")]
    Kafka{{"Kafka"}}
    Web["External Web"]

    Client --> Gateway
    Gateway --> Search
    Gateway --> Auth
    Gateway --> Analytics
    Gateway --> Crawler
    Gateway --> Indexer

    Search --> Redis
    Search --> PG
    Search -- "search_performed" --> Kafka

    Crawler --> Web
    Crawler --> PG
    Crawler -- "page_crawled" --> Kafka

    Kafka -- "page_crawled" --> Indexer
    Indexer --> PG

    Kafka -- "search_performed / result_clicked" --> Analytics
    Analytics --> PG

    Auth --> PG
```

**Architectural style:** microservices, polyglot, with a mix of synchronous (HTTP, via the gateway) and asynchronous (Kafka events) communication. There is no service mesh, no service discovery beyond Docker's internal DNS, and no distributed transaction coordinator — this is intentional, matching the project's learning scope.

**Boundaries:**
- The **Nginx Gateway** is the only externally reachable component.
- All other services, plus PostgreSQL/Redis/Kafka, live on an internal Docker network and are unreachable from outside the host.
- No service calls another service's HTTP API directly (peer-to-peer); cross-service communication is either through Kafka, or, for the client-facing case, routed back out through the gateway.

---

## 4. Service Breakdown

### 4.1 Nginx Gateway
- **Stack:** Nginx (Alpine image)
- **Responsibilities:** request routing, CORS handling, rate limiting, access logging, optional centralized JWT validation via `auth_request`, TLS termination (future), static frontend hosting (optional enhancement).
- **State:** stateless.
- **Scaling model:** can be scaled horizontally behind a load balancer if needed; not required for MVP.

### 4.2 Search Service
- **Stack:** Python + FastAPI
- **Responsibilities:** accept search queries, check Redis cache, query the inverted index, rank results, paginate, cache results, publish `search_performed` events.
- **State:** stateless (all state lives in PostgreSQL/Redis).
- **Dependencies:** PostgreSQL (read), Redis (read/write), Kafka (produce).

### 4.3 Crawler Service
- **Stack:** Python + FastAPI
- **Responsibilities:** fetch seed URLs, parse HTML, extract text/links, store pages, publish `page_crawled` events, enforce politeness (delay, page cap).
- **State:** in-memory `visited`/`to_visit` sets per crawl run (not persisted across restarts in the MVP).
- **Dependencies:** external web, PostgreSQL (write), Kafka (produce).

### 4.4 Indexer Service
- **Stack:** Python + FastAPI
- **Responsibilities:** consume `page_crawled` events, tokenize page content, compute term frequencies, upsert into the inverted index.
- **State:** stateless (Kafka consumer offsets track progress).
- **Dependencies:** Kafka (consume), PostgreSQL (read/write).

### 4.5 Auth Service
- **Stack:** Node.js + NestJS
- **Responsibilities:** registration, login, password hashing, JWT issuance and verification, exposing the current user's profile.
- **State:** stateless (JWTs are self-contained; no server-side session store).
- **Dependencies:** PostgreSQL (read/write).

### 4.6 Analytics Service
- **Stack:** Node.js + NestJS
- **Responsibilities:** log searches and clicks (via HTTP and/or Kafka), expose aggregated metrics (top queries, click-through rate).
- **State:** stateless (aggregates computed on read from PostgreSQL).
- **Dependencies:** PostgreSQL (read/write), Kafka (consume, optional).

---

## 5. Data Flow Diagrams

### 5.1 Crawling → Indexing Flow

```mermaid
sequenceDiagram
    participant C as Crawler Service
    participant Web as External Web
    participant PG as PostgreSQL
    participant K as Kafka (page_crawled)
    participant I as Indexer Service

    C->>Web: GET seed URL (timeout 5-10s)
    alt non-200 response
        Web-->>C: error status
        C->>C: log and skip URL
    else 200 OK
        Web-->>C: HTML content
        C->>C: parse_page() → title, text, links
        C->>PG: upsert into pages (ON CONFLICT url)
        C->>K: publish {page_id, url}
        C->>C: add new links to to_visit queue
        C->>C: wait politeness delay (same domain)
    end
    K-->>I: page_crawled event (consumer group)
    I->>PG: fetch page content by page_id
    I->>I: tokenize(text) → lowercase, strip punctuation, remove stopwords
    I->>I: count_term_frequencies(tokens)
    I->>PG: BEGIN TRANSACTION
    I->>PG: upsert term -> page_id -> frequency rows
    I->>PG: COMMIT
```

### 5.2 Search Request Flow (Full Detail)

```mermaid
sequenceDiagram
    participant U as User
    participant G as Nginx Gateway
    participant S as Search Service
    participant R as Redis
    participant PG as PostgreSQL
    participant K as Kafka (search_performed)
    participant A as Analytics Service

    U->>G: GET /search?q=query&page=1&limit=10
    G->>G: rate limit check (limit_req)
    G->>S: proxy request
    S->>S: parse_query(query) → tokens
    S->>R: check_cache("search:<query>")
    alt cache hit
        R-->>S: cached results (JSON)
    else cache miss
        S->>PG: for each token, look up inverted_index
        PG-->>S: page_id + term_frequency rows
        S->>S: aggregate scores per page_id (sum term frequencies)
        S->>S: sort page_ids by score, descending
        S->>PG: fetch_page_details(top page_ids)
        PG-->>S: title, url, snippet
        S->>S: cache_results(query, results, ttl=300s)
        S->>R: SETEX search:<query> 300 <results>
    end
    S->>S: paginate results (page, limit)
    S->>K: publish search_performed {query, result_count, timestamp, user_id?}
    K-->>A: consume event (async, does not block response)
    A->>PG: insert into search_logs
    S-->>G: 200 OK, JSON results
    G-->>U: 200 OK, JSON results
```

### 5.3 Auth Flow (Full Detail)

```mermaid
sequenceDiagram
    participant U as User
    participant G as Nginx Gateway
    participant Au as Auth Service
    participant PG as PostgreSQL

    U->>G: POST /auth/register {email, password}
    G->>Au: proxy request
    Au->>Au: validate DTO (@IsEmail, @MinLength)
    Au->>PG: SELECT * FROM users WHERE email = ?
    alt email already exists
        PG-->>Au: existing row
        Au-->>G: 409 Conflict
        G-->>U: 409 Conflict
    else email available
        Au->>Au: bcrypt.hash(password, saltRounds)
        Au->>PG: INSERT INTO users (...)
        Au-->>G: 201 Created (no password_hash in response)
        G-->>U: 201 Created
    end

    U->>G: POST /auth/login {email, password}
    G->>Au: proxy request
    Au->>PG: SELECT * FROM users WHERE email = ?
    alt user not found OR password mismatch
        Au-->>G: 401 Unauthorized
        G-->>U: 401 Unauthorized
    else credentials valid
        Au->>Au: bcrypt.compare(password, password_hash)
        Au->>Au: JwtService.sign({sub: user_id}, exp)
        Au-->>G: 200 OK {token}
        G-->>U: 200 OK {token}
    end

    U->>G: GET /auth/me (Authorization: Bearer <token>)
    G->>Au: proxy request
    Au->>Au: JwtStrategy validates signature + expiry
    alt token invalid/expired
        Au-->>G: 401 Unauthorized
    else token valid
        Au->>PG: fetch user by decoded user_id
        Au-->>G: 200 OK {user profile}
    end
    G-->>U: response
```

### 5.4 Click Tracking Flow

```mermaid
sequenceDiagram
    participant U as User
    participant G as Nginx Gateway
    participant A as Analytics Service
    participant K as Kafka (result_clicked)
    participant PG as PostgreSQL

    U->>G: POST /analytics/click {search_log_id, page_id}
    G->>A: proxy request
    alt Option A: direct HTTP ingestion
        A->>PG: INSERT INTO click_logs
        A-->>G: 201 Created
    else Option B: Kafka-based ingestion
        A->>K: publish result_clicked event
        K-->>A: consume event
        A->>PG: INSERT INTO click_logs
    end
    G-->>U: 201 Created
```

---

## 6. API Contracts

### 6.1 Search Service

**`GET /search`**
- Query params: `q` (string, required), `page` (int, default 1), `limit` (int, default 10)
- Response `200 OK`:
```json
{
  "query": "example",
  "total_results": 42,
  "page": 1,
  "results": [
    {"page_id": 1, "title": "...", "url": "...", "snippet": "..."}
  ]
}
```
- Errors: `400 Bad Request` if `q` is missing or empty.

### 6.2 Crawler Service

**`POST /crawl/start`** — triggers a crawl run. Response: `202 Accepted`.
**`GET /crawl/status`** — Response: `{"pages_crawled": 37, "in_progress": true}`.

### 6.3 Indexer Service

**`GET /index/status`** — Response: `{"total_indexed_pages": 37, "total_unique_terms": 1520}`.

### 6.4 Auth Service

**`POST /auth/register`**
- Body: `{"email": "user@example.com", "password": "min 8 chars"}`
- Response `201 Created`: `{"id": "uuid", "email": "user@example.com"}`
- Errors: `400 Bad Request` (validation), `409 Conflict` (email exists).

**`POST /auth/login`**
- Body: `{"email": "...", "password": "..."}`
- Response `200 OK`: `{"access_token": "<jwt>", "expires_in": 3600}`
- Errors: `401 Unauthorized`.

**`GET /auth/me`** (protected)
- Header: `Authorization: Bearer <jwt>`
- Response `200 OK`: `{"id": "uuid", "email": "...", "created_at": "..."}`
- Errors: `401 Unauthorized`.

### 6.5 Analytics Service

**`POST /analytics/search`** — `{"query": "...", "user_id": "uuid|null"}` → `201 Created`
**`POST /analytics/click`** — `{"search_log_id": 1, "page_id": 1}` → `201 Created`
**`GET /analytics/top-queries`** — `200 OK`: `[{"query": "...", "count": 42}, ...]`
**`GET /analytics/click-through-rate?window=7d`** — `200 OK`: `{"ctr": 0.23, "window": "7d"}`

### 6.6 Health Checks (all services)

**`GET /health`** — `200 OK`: `{"status": "ok"}`

---

## 7. Data Model

### 7.1 Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SEARCH_LOGS : "performs (optional)"
    PAGES ||--o{ INVERTED_INDEX : "indexed by"
    SEARCH_LOGS ||--o{ CLICK_LOGS : "leads to"
    PAGES ||--o{ CLICK_LOGS : "clicked"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
    }

    PAGES {
        int id PK
        string url UK
        string title
        text content
        timestamp crawled_at
    }

    INVERTED_INDEX {
        int id PK
        string term
        int page_id FK
        int term_frequency
    }

    SEARCH_LOGS {
        int id PK
        string query
        uuid user_id FK "nullable"
        timestamp searched_at
    }

    CLICK_LOGS {
        int id PK
        int search_log_id FK
        int page_id FK
        timestamp clicked_at
    }
```

### 7.2 Table Notes

| Table | Owning Service(s) | Index Notes |
|---|---|---|
| `users` | Auth Service | Unique index on `email` |
| `pages` | Crawler (write), Search (read) | Unique index on `url` |
| `inverted_index` | Indexer (write), Search (read) | Index on `term` (main lookup path); composite index on `(term, page_id)` recommended to speed up joins |
| `search_logs` | Analytics Service | Index on `searched_at` for time-window queries; index on `query` for `top-queries` aggregation |
| `click_logs` | Analytics Service | Index on `search_log_id`, index on `page_id` |

### 7.3 Consistency Notes

- `pages.url` uses an upsert (`ON CONFLICT`) so re-crawling never creates duplicate rows.
- `inverted_index` updates are wrapped in a transaction per page, so a crash mid-update never leaves partial term data for that page.
- `search_logs.user_id` is nullable — anonymous searches are logged without a user reference.
- No foreign key constraint is enforced *across databases* (Auth and Analytics may use separate schemas/databases); if `search_logs.user_id` references a user that no longer exists, that is acceptable for analytics purposes (soft reference).

---

## 8. Caching Strategy

| Aspect | Decision |
|---|---|
| Cache store | Redis |
| Cache key | `search:<normalized_query>` |
| Cache value | Full JSON result set (pre-pagination or post-pagination — decide per implementation; pre-pagination is more reusable across page numbers) |
| TTL | 300 seconds (5 minutes) — balances freshness against crawl/index update frequency |
| Invalidation | Time-based only (TTL expiry); no active invalidation on re-index for MVP simplicity |
| Cache stampede protection | Not implemented in MVP (acceptable at this scale); could add a short-lived lock or request coalescing later |
| Cache miss behavior | Falls through to PostgreSQL; result is cached before returning |
| Failure mode | If Redis is unreachable, Search Service should catch the exception and fall back to querying PostgreSQL directly (fail open, not fail closed) |

---

## 9. Messaging / Kafka Design

### 9.1 Topics

```mermaid
flowchart LR
    Crawler -->|page_crawled| T1[("page_crawled")]
    T1 --> Indexer

    Search -->|search_performed| T2[("search_performed")]
    T2 --> Analytics

    Frontend -.->|result_clicked| T3[("result_clicked")]
    T3 --> Analytics
```

| Topic | Producer | Consumer | Payload | Delivery Semantics |
|---|---|---|---|---|
| `page_crawled` | Crawler Service | Indexer Service | `{page_id, url}` | At-least-once; Indexer's `update_index` upsert is idempotent, so reprocessing is safe |
| `search_performed` | Search Service | Analytics Service | `{query, result_count, timestamp, user_id?}` | At-least-once; duplicate log rows are acceptable for approximate analytics |
| `result_clicked` | Frontend / Search Service | Analytics Service | `{search_log_id, page_id, timestamp}` | At-least-once |

### 9.2 Why Kafka Here

- **Decoupling in time:** the Crawler can keep crawling even if the Indexer is temporarily down; messages queue up and are processed once it's back.
- **Decoupling in failure domain:** a crash in Analytics never blocks or slows down a live search request, since publishing to `search_performed` is fire-and-forget from the Search Service's perspective.
- **Natural fit for event-driven aggregation:** Analytics is inherently a "collect events over time" service.

### 9.3 Consumer Group Considerations

- Each consumer service uses its own Kafka consumer group (e.g. `indexer-group`, `analytics-group`) so multiple topics/consumers don't interfere.
- Offsets are committed after successful processing (not before), so a crash mid-processing causes reprocessing of that message rather than silent loss — this is why idempotent upserts matter (see 9.1).
- If a consumer is restarted, it resumes from the last committed offset rather than reprocessing the entire topic from the start.

---

## 10. Authentication & Authorization

### 10.1 Token Design

- JWT signed with a single shared `JWT_SECRET` (HMAC, e.g. HS256).
- Claims: `sub` (user id), `iat`, `exp` (expiry, e.g. 60 minutes via `JWT_EXPIRE_MINUTES`).
- No refresh tokens in the MVP — the user simply logs in again after expiry.

### 10.2 Verification Strategy

```mermaid
flowchart LR
    subgraph Option_A["Option A: Independent verification (MVP default)"]
        Client1["Client"] --> GW1["Gateway"] --> SvcA["Any service"]
        SvcA --> Verify1["Verify JWT locally using shared JWT_SECRET"]
    end

    subgraph Option_B["Option B: Centralized at gateway"]
        Client2["Client"] --> GW2["Gateway"]
        GW2 --> AuthCheck["auth_request to Auth Service /auth/verify"]
        AuthCheck -->|valid| SvcB["Downstream service trusts X-User-Id header"]
    end
```

- **Option A (default for MVP):** every service capable of receiving authenticated requests verifies the JWT independently using the shared secret (`python-jose`/`pyjwt` for Python, `@nestjs/jwt`/Passport for NestJS). Simple, no single point of failure, slightly duplicated logic.
- **Option B (future):** Nginx's `auth_request` directive calls a lightweight `/auth/verify` endpoint on the Auth Service; on success, the gateway injects a trusted `X-User-Id` header for downstream services, which then skip re-verifying the token themselves.

### 10.3 Password Storage

- Passwords are never stored in plaintext or reversibly encrypted.
- `bcrypt` with a reasonable cost factor (e.g. 10–12 rounds) is used for hashing.
- The password hash is never included in any API response (enforced via response DTOs / `class-transformer`'s `@Exclude()`).

---

## 11. Gateway Design (Nginx)

### 11.1 Responsibilities

```mermaid
flowchart TB
    Gateway["Nginx Gateway"]
    Gateway --> R1["Routing: path-based proxy_pass to upstreams"]
    Gateway --> R2["Rate limiting: limit_req_zone per IP"]
    Gateway --> R3["CORS: add_header / preflight handling"]
    Gateway --> R4["Access logging: method, path, status, latency"]
    Gateway --> R5["Optional: auth_request for centralized JWT check"]
    Gateway --> R6["Optional: TLS termination"]
    Gateway --> R7["Optional: static frontend hosting"]
```

### 11.2 Routing Table

| Path prefix | Upstream |
|---|---|
| `/search/*` | `search-service:8000` |
| `/auth/*` | `auth-service:8000` |
| `/analytics/*` | `analytics-service:8000` |
| `/crawl/*` | `crawler-service:8000` |
| `/index/*` | `indexer-service:8000` |

### 11.3 Why Nginx Instead of a Custom Gateway Service

- No application code required for pure routing — fewer moving parts to maintain and debug.
- Mature, battle-tested handling of concurrent connections, keep-alives, and proxying edge cases.
- Built-in primitives for rate limiting (`limit_req`), TLS (`listen 443 ssl`), and static file serving that would otherwise need to be reimplemented in a code-based gateway.
- Matches how gateways are commonly implemented in real production systems, making this a more transferable skill than a hand-rolled FastAPI proxy.

---

## 12. Deployment View

```mermaid
flowchart TB
    subgraph Host["Host Machine"]
        Port["localhost:8000"]
    end

    subgraph DockerNetwork["Docker Network (internal, bridge)"]
        Gateway["gateway (Nginx)"]
        Search["search-service"]
        Crawler["crawler-service"]
        Indexer["indexer-service"]
        Auth["auth-service"]
        Analytics["analytics-service"]
        PG[("postgres")]
        Redis[("redis")]
        Kafka{{"kafka"}}
    end

    Port --> Gateway
    Gateway --> Search & Auth & Analytics & Crawler & Indexer
    Search --> PG & Redis
    Crawler --> PG
    Indexer --> PG
    Auth --> PG
    Analytics --> PG
    Search -.Kafka.- Kafka
    Crawler -.Kafka.- Kafka
    Indexer -.Kafka.- Kafka
    Analytics -.Kafka.- Kafka
```

- Only the gateway's port (`8000:80`) is published to the host.
- Every other service, plus PostgreSQL, Redis, and Kafka, is reachable only inside the Docker network, by service name (Docker's embedded DNS resolves `search-service`, `postgres`, etc. automatically).
- `depends_on` in `docker-compose.yml` controls startup order only, not readiness — each service's own retry logic (DB connection retries, Kafka connection retries) is what actually guarantees correct behavior on cold start.

---

## 13. Configuration & Environment

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | All services touching PostgreSQL | Connection string, e.g. `postgresql://user:password@postgres:5432/search_engine` |
| `REDIS_URL` | Search Service | Connection string, e.g. `redis://redis:6379/0` |
| `KAFKA_BROKER` | Crawler, Indexer, Search, Analytics | Broker address, e.g. `kafka:9092` |
| `JWT_SECRET` | Auth Service, and any service verifying JWTs | Shared HMAC signing secret |
| `JWT_EXPIRE_MINUTES` | Auth Service | Token lifetime |

- A single root `.env` (or per-service `.env` files) centralizes these values; Docker Compose injects them into each container's environment.
- Container-to-container references always use the Docker Compose **service name** (`postgres`, `redis`, `kafka`), never `localhost`, since each container has its own network namespace.
- Secrets (`JWT_SECRET`, `DATABASE_URL` credentials) are excluded from version control via `.gitignore`.

---

## 14. Error Handling & Resilience

| Failure | Where | Mitigation |
|---|---|---|
| Downstream service unreachable | Gateway | Nginx returns `502 Bad Gateway`; `depends_on` + service-level retry logic reduces likelihood on startup |
| Redis unreachable | Search Service | Catch exception, log warning, fall back to querying PostgreSQL directly (fail open) |
| Kafka unreachable at startup | Crawler / Indexer / Search / Analytics | Retry loop with backoff on connection (`aiokafka`/`kafka-python` retries; `KafkaJS` built-in retry config or manual `onModuleInit` retry) |
| Malformed Kafka message | Indexer / Analytics | Wrap consumer handler in try/catch; log and discard the bad message rather than crashing the consumer loop |
| Non-200 response while crawling | Crawler | Log and skip the URL; continue with the rest of the queue |
| Partial index update crash | Indexer | Wrap `update_index` in a DB transaction so a crash mid-update leaves no partial term rows for that page |
| Invalid/expired JWT | Auth Service / any verifying service | Return `401 Unauthorized`; client must re-authenticate |
| Malformed request body | Auth Service / Analytics Service | `class-validator` DTOs + a global `ValidationPipe` reject the request with `400 Bad Request` before it reaches business logic |
| Duplicate registration email | Auth Service | Explicit check before insert; return `409 Conflict` |
| Runaway crawl | Crawler | Hard cap on total pages crawled per run (e.g. 100) |

---

## 15. Observability (Logging, Metrics, Tracing)

### 15.1 Logging

- Every service logs at least: request method/path, response status, and unhandled exceptions.
- Python services use the standard `logging` module with structured (or at least consistent) log lines.
- NestJS services use Nest's built-in `Logger`.
- Nginx logs every proxied request via `access_log` (method, path, status, latency) and errors via `error_log`; this is the single best place to see aggregate traffic since it's the only path all external requests take.

### 15.2 Metrics (optional enhancement)

- Application-level: request counts, latency percentiles, and error rates per service — collected via Prometheus client libraries (`prometheus-fastapi-instrumentator` for Python, `@willsoto/nestjs-prometheus` for NestJS).
- Gateway-level: Nginx's `stub_status` module exposes basic connection/request metrics, scrapeable via an `nginx-prometheus-exporter` sidecar.
- Visualized via Grafana dashboards once Prometheus is wired in.

### 15.3 Tracing (out of scope for MVP)

- Not implemented in the MVP. If added later, a correlation ID (e.g. `X-Request-Id`) generated at the gateway and propagated through Kafka message headers and HTTP calls would let a single search request be traced across Search → Kafka → Analytics.

---

## 16. Security Considerations

| Area | Approach |
|---|---|
| Password storage | `bcrypt` hashing, never plaintext or reversible encryption |
| Token security | Signed JWTs with expiry; shared secret kept out of source control |
| Transport security | TLS termination at the gateway (future enhancement); plaintext HTTP acceptable for local/dev only |
| Input validation | `class-validator` DTOs on NestJS services; Pydantic models on FastAPI services |
| SQL injection | Parameterized queries via ORMs (SQLAlchemy, TypeORM) — no raw string-concatenated SQL |
| Secrets management | `.env` files excluded from git; in production these would move to a secrets manager, not committed config |
| Rate limiting | `limit_req_zone`/`limit_req` at the Nginx gateway to blunt basic abuse/scraping of the Search endpoint |
| CORS | Explicitly configured at the gateway to only allow the known frontend origin(s) |
| Least exposure | Only the gateway's port is published to the host; all other services and infrastructure are internal-only |

---

## 17. Scalability & Performance

- **Current scale target:** a few thousand crawled pages, low concurrent user count — appropriate for a learning project, not a production workload.
- **Search Service** is stateless and could be scaled horizontally (multiple containers behind the same Nginx upstream) if search traffic grew, since all state lives in PostgreSQL/Redis.
- **Indexer Service** could be scaled by increasing Kafka partitions on `page_crawled` and running multiple consumer instances in the same consumer group, each processing a subset of partitions.
- **PostgreSQL** is a single instance with no read replicas in the MVP; the `inverted_index.term` index is the main lever for keeping lookups fast as the index grows.
- **Redis** cache absorbs repeated identical queries, which is the cheapest way to improve perceived latency without touching the ranking algorithm.
- **Known bottleneck at scale:** the naive `inverted_index` schema (one row per term-page pair with no compression) will grow large; a real search engine would use compressed postings lists — acceptable trade-off for this project's learning goals.

---

## 18. Failure Scenarios & Mitigations

```mermaid
flowchart TD
    F1["Gateway restarts"] --> M1["Docker Compose restarts container; brief downtime, no data loss (stateless)"]
    F2["Kafka broker restarts"] --> M2["Producers/consumers retry with backoff; committed messages are not lost"]
    F3["Indexer crashes mid-batch"] --> M3["Consumer resumes from last committed offset; transactional upserts prevent partial index corruption"]
    F4["Redis restarts / cache cleared"] --> M4["Search Service falls back to PostgreSQL; cache repopulates naturally"]
    F5["PostgreSQL restarts"] --> M5["Services error briefly; connection retry logic recovers them"]
    F6["Crawler hits a slow/unresponsive site"] --> M6["Per-request timeout (5-10s) prevents the crawl from hanging"]
```

---

## 19. Testing Strategy

| Layer | Approach |
|---|---|
| Unit tests | Pure logic: tokenizer, scoring/ranking, password hashing, JWT generation — `pytest` (Python), Jest (NestJS) |
| Integration tests | Endpoint-level tests against a real (isolated/test) database — `pytest` + `httpx.AsyncClient`/`TestClient` (Python), `@nestjs/testing` + `supertest` (NestJS) |
| Gateway tests | `curl`/scripted requests through the exposed gateway port to confirm each `location` block routes correctly |
| End-to-end tests | Manual or scripted full flow: crawl → confirm `pages` populated → confirm `inverted_index` populated → search → confirm results → confirm `search_logs` populated |
| Resilience tests | Restart the Indexer mid-crawl and confirm correct offset resumption; kill Redis and confirm Search Service falls back gracefully |
| Load tests | Lightweight load testing of the Search Service (e.g. `locust`) to observe behavior under concurrent requests, including through the Nginx gateway |

---

## 20. Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off Accepted |
|---|---|---|
| Polyglot split (Python core, NestJS CRUD) | Each stack used where it's strongest; shared tokenizer stays in one language | Two toolchains to maintain, two sets of conventions |
| Kafka for cross-service events | Decouples producers/consumers in time and failure domain | Added operational complexity (topics, consumer groups, offsets) vs. plain HTTP calls |
| Nginx as gateway | No app code needed for routing; production-realistic | Centralized JWT validation (`auth_request`) is more complex to wire than doing it in application code |
| Shared JWT secret across languages | Any service can verify tokens independently, no auth service dependency per request | Secret rotation requires updating every service simultaneously |
| Redis as pure cache (not source of truth) | Simple consistency model; safe to evict/expire | Cold queries (cache miss) pay the full PostgreSQL query cost |
| Hand-built inverted index on PostgreSQL | Best learning value — see how a search engine's core index actually works | Not competitive with Elasticsearch/Solr at real scale |
| No distributed transactions | Keeps each service simple and independently deployable | Cross-service consistency (e.g. a page appearing in `pages` before it's indexed) is eventual, not immediate |

---

## 21. Future Enhancements

1. TF-IDF / BM25 ranking instead of raw term-frequency sums.
2. Centralized JWT validation at the gateway via `auth_request`.
3. TLS termination and HTTPS enforcement at the gateway.
4. Prometheus + Grafana monitoring across all services, including the gateway.
5. Incremental re-crawling based on `crawled_at` age.
6. Horizontal scaling of the Search Service and Indexer consumer group.
7. Distributed tracing with correlation IDs propagated through Kafka headers.
8. Replacing polling-based analytics endpoints with materialized views for heavy aggregations.

---

## 22. Glossary

| Term | Meaning |
|---|---|
| Inverted index | A data structure mapping each term to the list of pages (and frequencies) containing it — the core structure that makes search fast |
| Upsert | An insert-or-update operation, here implemented via `ON CONFLICT` (PostgreSQL) |
| Consumer group | A set of Kafka consumers that share the work of reading a topic's partitions, used so a topic's messages are processed exactly once per group |
| TTL | Time to live — how long a cached value remains valid before automatic expiry |
| DTO | Data Transfer Object — a validated shape for request/response payloads, used in NestJS via `class-validator` |
| Reverse proxy | A server that sits in front of backend services and forwards client requests to the correct one, here implemented with Nginx |
| JWT | JSON Web Token — a signed, self-contained token used to represent an authenticated session without server-side session storage |
