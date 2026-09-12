# Search Engine Microservices Project Plan

## Overview

This project is a simplified search engine built using a microservices architecture. The goal is to learn how microservices communicate with each other and how a basic search engine (crawling, indexing, searching) works, without getting lost in unnecessary complexity.

## Tech Stack

| Service | Technology | Responsibility |
|---|---|---|
| Search Service | Python + FastAPI | Receives search queries and returns results |
| Crawler Service | Python + FastAPI | Crawls websites and collects raw content |
| Indexer Service | Python + FastAPI | Builds and maintains the inverted index |
| Auth Service | Node.js + NestJS | Register / Login / JWT authentication |
| Analytics Service | Node.js + NestJS | Logs searches and click events |
| Gateway | **Nginx** | Reverse proxy / API Gateway routing requests to all services |

## Infrastructure

- PostgreSQL: primary database (users, metadata, analytics)
- Redis: caching layer (search results, sessions)
- Kafka: asynchronous communication between services
- **Nginx: reverse proxy / API Gateway, and static file server for the frontend**
- Docker: containerization and local orchestration

## Architecture (Simplified)

```
                 Frontend
                    |
                    v
             Nginx Gateway
                    |
       -------------+-------------
       |            |            |
    Search        Auth       Analytics
       |
       v
     Redis
       |
       v
    Indexer
       ^
       |
     Kafka
       ^
       |
    Crawler
       |
       v
      Web
```

## Design Decision

The core search-engine services (Search, Crawler, Indexer) use Python + FastAPI, while Auth and Analytics use Node.js + NestJS. This split is intentional:

- Search, Crawler, and Indexer are the heart of the "search engine" learning goal (crawling, tokenizing, scoring, caching), so keeping them in one language (Python) keeps that core logic easy to reason about and easy to share code between (e.g. a common tokenizer module).
- Auth and Analytics are more standard, structure-heavy CRUD/API concerns (validation, guards, modules, DTOs), which is exactly what NestJS is built for, so building them in NestJS is a good opportunity to practice a second stack without touching the search-engine core.
- Both frameworks talk to the same PostgreSQL, Redis, and Kafka infrastructure, so this is also a good exercise in keeping a polyglot microservices setup consistent (shared `.env` conventions, shared Kafka topic contracts, consistent JWT secret across languages).
- **The Gateway itself uses Nginx instead of a hand-written code service. Nginx is a battle-tested, lightweight reverse proxy that requires no application code to route requests, handles many concurrent connections efficiently, and is what's actually used in most real-world production setups — making it both simpler for the MVP and a more realistic learning experience than a custom FastAPI gateway.**

Once the MVP is working end to end, infrastructure pieces (Nginx Gateway, Kafka, Docker) can be added gradually rather than all at once.

---

## Project Steps (Detailed)

### Step 1: Project Setup

1. Create one monorepo (recommended over separate repos for a learning project, since it is easier to run and track everything together).
2. Create the base folder structure:
   ```
   search-engine/
     search-service/
       app/
         main.py
         routes.py
         cache.py
         config.py
       requirements.txt
       Dockerfile
     crawler-service/
       app/
         main.py
         crawler.py
         producer.py
         config.py
       requirements.txt
       Dockerfile
     indexer-service/
       app/
         main.py
         consumer.py
         indexer.py
         tokenizer.py
         config.py
       requirements.txt
       Dockerfile
     auth-service/
       src/
         main.ts
         app.module.ts
         auth/
           auth.controller.ts
           auth.service.ts
           auth.module.ts
           dto/
             register.dto.ts
             login.dto.ts
         users/
           user.entity.ts
           users.module.ts
         config/
           configuration.ts
       package.json
       tsconfig.json
       Dockerfile
     analytics-service/
       src/
         main.ts
         app.module.ts
         analytics/
           analytics.controller.ts
           analytics.service.ts
           analytics.module.ts
           entities/
             search-log.entity.ts
             click-log.entity.ts
         config/
           configuration.ts
       package.json
       tsconfig.json
       Dockerfile
     gateway/
       nginx.conf
       Dockerfile
     frontend/
       index.html
       app.js
       styles.css
     docker-compose.yml
     .env
   ```
3. For the Python services (Search, Crawler, Indexer), create a virtual environment per service and install base dependencies:
   ```
   fastapi
   uvicorn
   pydantic
   python-dotenv
   ```
   Add service-specific dependencies later as needed (e.g. `sqlalchemy`, `psycopg2-binary`, `redis`, `kafka-python`, `beautifulsoup4`, `httpx`).
4. For the NestJS services (Auth, Analytics), scaffold each with the Nest CLI (`npm i -g @nestjs/cli`, then `nest new auth-service` / `nest new analytics-service`) and install base dependencies:
   ```
   @nestjs/config
   @nestjs/typeorm typeorm pg
   class-validator class-transformer
   ```
   Add service-specific dependencies later as needed (e.g. `@nestjs/jwt` and `@nestjs/passport` + `passport-jwt` for Auth, `bcrypt` for password hashing, `kafkajs` or `@nestjs/microservices` with the Kafka transport for both, once Step 8 is reached).
5. Set up a `.env` file per service (or one shared `.env` at the root, referenced by all services) containing:
   ```
   DATABASE_URL=postgresql://user:password@postgres:5432/search_engine
   REDIS_URL=redis://redis:6379/0
   KAFKA_BROKER=kafka:9092
   JWT_SECRET=change_this_secret
   JWT_EXPIRE_MINUTES=60
   ```
6. Create a `config.py` in each Python service (using `pydantic.BaseSettings` or `python-dotenv` + `os.environ`) and a `config/configuration.ts` in each NestJS service (loaded via `@nestjs/config`'s `ConfigModule.forRoot`), so configuration is centralized and consistent across both stacks.
7. Create a minimal entry point in each service with a `/health` endpoint returning `{"status": "ok"}`:
   - Python services: confirm each runs independently with `uvicorn app.main:app --reload` on a different local port (e.g. 8001 to 8003).
   - NestJS services: confirm each runs independently with `npm run start:dev` on a different local port (e.g. 8004 to 8005), setting the port via `app.listen()` in `main.ts`.
8. Initialize a git repository at the root, add a `.gitignore` covering `__pycache__/`, `.env`, `venv/`, `node_modules/`, `dist/`, and commit the initial skeleton.

### Step 2: Database and Cache Setup

1. Run PostgreSQL and Redis locally via Docker for development, using a simple `docker-compose.dev.yml` with just these two services, so you are not rebuilding the full stack on every change.
2. Connect to PostgreSQL using a client (e.g. `psql`, DBeaver, or TablePlus) to verify it is reachable.
3. Design and create the initial schema. Suggested tables:
   - `users`
     - `id` (UUID or serial, primary key)
     - `email` (unique, not null)
     - `password_hash` (not null)
     - `created_at` (timestamp)
   - `pages`
     - `id` (serial, primary key)
     - `url` (unique, not null)
     - `title` (text)
     - `content` (text)
     - `crawled_at` (timestamp)
   - `inverted_index`
     - `id` (serial, primary key)
     - `term` (text, indexed)
     - `page_id` (foreign key to `pages.id`)
     - `term_frequency` (integer)
   - `search_logs`
     - `id` (serial, primary key)
     - `query` (text)
     - `user_id` (nullable foreign key to `users.id`)
     - `searched_at` (timestamp)
   - `click_logs`
     - `id` (serial, primary key)
     - `search_log_id` (foreign key to `search_logs.id`)
     - `page_id` (foreign key to `pages.id`)
     - `clicked_at` (timestamp)
4. Decide on an ORM approach per stack: SQLAlchemy with Alembic for the Python services (Crawler, Indexer, and Search if it ever needs direct DB access), and TypeORM (or Prisma, if preferred) with its built-in migration generator for the NestJS services (Auth, Analytics).
5. Set up models matching the schema above in each relevant service: SQLAlchemy models for `pages` and `inverted_index` in Crawler/Indexer, and TypeORM entities for `users` in Auth Service and `search_logs`/`click_logs` in Analytics Service.
6. Initialize Alembic for the Python services and generate the first migration to create the `pages` and `inverted_index` tables. For the NestJS services, enable `synchronize: false` in the TypeORM config and use `typeorm migration:generate` to create the first migration for `users`, `search_logs`, and `click_logs` (avoid `synchronize: true` beyond local experimentation, since it can silently alter production schemas).
7. Set up a Redis connection helper (e.g. `redis.asyncio` client) in the Search Service, with a simple `get_cache(key)` and `set_cache(key, value, ttl)` wrapper function.
8. Write a small standalone test script that connects to PostgreSQL and Redis from a FastAPI service and confirms both work before writing any real business logic.

### Step 3: Build the Crawler Service

1. Decide on a seed list of starting URLs (a small hardcoded list is fine for the MVP, e.g. 5 to 10 URLs).
2. Install `httpx` (for async HTTP requests) and `beautifulsoup4` (for HTML parsing).
3. Write a `fetch_page(url)` function that:
   - Sends an HTTP GET request with a timeout (e.g. 5 to 10 seconds).
   - Handles non-200 responses gracefully (log and skip).
   - Returns the raw HTML content.
4. Write a `parse_page(html, url)` function that:
   - Extracts the page `<title>`.
   - Extracts visible text content (strip scripts, styles, and navigation clutter).
   - Extracts all `<a href>` links, resolves relative URLs to absolute ones, and filters out duplicates.
5. Write a `save_page(url, title, content)` function that inserts or updates a row in the `pages` table (use `ON CONFLICT` upsert logic on the `url` column to avoid duplicate rows on re-crawl).
6. Write a simple crawl queue mechanism:
   - Maintain a `visited` set to avoid re-crawling the same URL in one run.
   - Maintain a `to_visit` queue starting with the seed URLs.
   - For each URL: fetch, parse, save, then add newly discovered links to `to_visit` (cap total pages crawled per run, e.g. 100, to avoid runaway crawling).
7. Add basic politeness rules:
   - A small delay between requests to the same domain (e.g. 1 second).
   - Respect `robots.txt` where feasible (optional for MVP, but good practice).
8. After successfully saving a page, publish a Kafka message to the `page_crawled` topic containing `{"page_id": ..., "url": ...}` using `kafka-python` or `aiokafka`.
9. Expose an endpoint (e.g. `POST /crawl/start`) that triggers a crawl run manually, plus a `/crawl/status` endpoint returning how many pages have been crawled so far, for easy manual testing.
10. Add structured logging (e.g. using Python's `logging` module) so crawl failures and successes are visible in the console/logs.

### Step 4: Build the Indexer Service

1. Install `kafka-python` (or `aiokafka`) for consuming events, and `nltk` or a simple custom tokenizer for text processing (a simple regex-based tokenizer is enough for the MVP, no need for heavy NLP libraries).
2. Write a Kafka consumer that subscribes to the `page_crawled` topic and processes messages one at a time (or in small batches).
3. Write a `tokenize(text)` function that:
   - Lowercases the text.
   - Removes punctuation and non-alphanumeric characters.
   - Splits into individual words.
   - Removes common stop words (a small hardcoded stop word list is fine, e.g. "the", "and", "is", "a", "of").
4. Write a `count_term_frequencies(tokens)` function that returns a dictionary of `{term: frequency}` for a given page's tokens.
5. Write an `update_index(page_id, term_frequencies)` function that:
   - For each term, inserts or updates a row in the `inverted_index` table linking `term -> page_id` with the computed frequency.
   - Uses a database transaction so a partial failure does not leave the index in an inconsistent state.
6. On receiving a `page_crawled` Kafka message:
   - Fetch the page content from the `pages` table using `page_id`.
   - Tokenize the content.
   - Compute term frequencies.
   - Call `update_index`.
7. Add an index on the `term` column in `inverted_index` (if not already created in Step 2) since this is the main lookup path used by the Search Service.
8. Expose a `/index/status` endpoint returning basic stats (total indexed pages, total unique terms) for manual verification.
9. Test independently: manually insert a row into `pages`, publish a fake `page_crawled` Kafka message, and confirm the `inverted_index` table gets populated correctly.

### Step 5: Build the Search Service

1. Install `redis` client library and confirm connectivity (already set up in Step 2).
2. Design the search endpoint: `GET /search?q=<query>&page=1&limit=10`.
3. Write a `parse_query(query)` function that tokenizes the incoming query the same way the Indexer Service tokenizes page content (important: use the same tokenizer logic in both services, ideally shared as a common module, to avoid mismatches).
4. Write a `check_cache(query)` function that looks up a Redis key (e.g. `search:<query>`) and returns cached results if present.
5. Write a `query_index(tokens)` function that:
   - For each token, looks up matching `page_id`s and `term_frequency` values from `inverted_index`.
   - Aggregates scores per `page_id` across all query tokens (simple sum of term frequencies as an initial scoring method).
   - Sorts `page_id`s by aggregated score, descending.
6. Write a `fetch_page_details(page_ids)` function that retrieves `title`, `url`, and a short content snippet for the top-ranked pages from the `pages` table.
7. Write a `cache_results(query, results)` function that stores the final result list in Redis with a TTL (e.g. 300 seconds).
8. Wire it all together in the `/search` endpoint:
   - Check cache first, return immediately if hit.
   - If miss, tokenize query, run `query_index`, fetch page details, cache the results, then return them.
9. Add pagination logic (`page` and `limit` query params) so results are sliced correctly before returning.
10. Publish a `search_performed` Kafka event (query text, result count, timestamp) after each search, to be consumed later by the Analytics Service.
11. Return a clear JSON response shape, e.g.:
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

### Step 6: Build the Auth Service (NestJS)

1. Install `bcrypt` for password hashing and `@nestjs/jwt` (plus `@nestjs/passport`, `passport`, `passport-jwt` if you want a full Passport-based guard) for JWT handling.
2. Define the `User` TypeORM entity matching the `users` table from Step 2, and a `UsersModule`/`UsersService` that wraps basic lookups (`findByEmail`, `create`).
3. Create an `AuthModule` with a `POST /auth/register` endpoint (using a `RegisterDto` validated with `class-validator` decorators):
   - Accepts `email` and `password`.
   - Validates email format and password strength (minimum length at least) via DTO decorators (`@IsEmail()`, `@MinLength()`).
   - Checks if the email already exists via `UsersService`; return a clear 409/400 error if so.
   - Hashes the password using `bcrypt.hash` before storing.
   - Saves the new user and returns a success response (never return the password hash — use a response DTO or `class-transformer`'s `@Exclude()`).
4. Write a `POST /auth/login` endpoint (using a `LoginDto`):
   - Accepts `email` and `password`.
   - Looks up the user by email via `UsersService`.
   - Verifies the password against the stored hash with `bcrypt.compare`.
   - On success, generates a JWT containing `user_id` (`sub`) and an expiration claim via `JwtService.sign`, signed with `JWT_SECRET` (configured through `JwtModule.registerAsync` reading from `ConfigService`).
   - Returns the token to the client.
5. Write a `JwtStrategy` (extending `PassportStrategy(Strategy)`) that:
   - Extracts the JWT from the `Authorization: Bearer <token>` header (`ExtractJwt.fromAuthHeaderAsBearerToken()`).
   - Verifies the signature and expiration against `JWT_SECRET`.
   - Decodes the `user_id` and returns the payload (or the fetched user) to be attached to `request.user`.
   - Wrap it in a `JwtAuthGuard` (extending `AuthGuard('jwt')`) that throws a 401 when the token is missing, invalid, or expired.
6. Add a protected example endpoint, e.g. `GET /auth/me`, decorated with `@UseGuards(JwtAuthGuard)`, that reads `request.user` to return the current user's profile, useful for testing the flow end to end.
7. Decide how other services will validate tokens: either they all share the same `JWT_SECRET` and verify tokens independently (Python services can verify NestJS-issued JWTs with `python-jose`/`pyjwt` since it's a standard JWT, no NestJS-specific decoding needed), or **Nginx validates tokens centrally via its `auth_request` directive, calling a small internal verification endpoint on the Auth Service and forwarding a trusted user identity downstream** (simpler for the MVP: shared secret, independent verification per service, is still perfectly fine to start with — see Step 9 for the Nginx-based option).

### Step 7: Build the Analytics Service (NestJS)

1. Define `SearchLog` and `ClickLog` TypeORM entities matching the tables from Step 2, grouped under an `AnalyticsModule`.
2. Decide on ingestion method:
   - Option A (simpler for MVP): expose `POST /analytics/search` and `POST /analytics/click` endpoints (with DTOs validated via `class-validator`) that other services or the frontend call directly.
   - Option B (more "microservices-correct"): consume `search_performed` and `result_clicked` events from Kafka instead of direct HTTP calls, using Nest's `@nestjs/microservices` Kafka transport (`@MessagePattern`/`@EventPattern` decorators) or the `kafkajs` client directly.
   - Recommendation: start with Option A for simplicity, then migrate to Option B once Kafka wiring (Step 8) is in place.
3. Implement `POST /analytics/search` to insert a row into `search_logs` with the query text, optional `user_id`, and timestamp, via a repository injected with `@InjectRepository(SearchLog)`.
4. Implement `POST /analytics/click` to insert a row into `click_logs` linking a `search_log_id` and `page_id`.
5. Implement a `GET /analytics/top-queries` endpoint that returns the most frequently searched terms (simple `GROUP BY query ORDER BY count DESC LIMIT 10` query, via TypeORM's query builder).
6. Implement a `GET /analytics/click-through-rate` endpoint that computes the ratio of clicks to searches over a given time window, as a basic engagement metric.
7. Add a global `ValidationPipe` (`app.useGlobalPipes(new ValidationPipe())`) so malformed analytics payloads are rejected automatically, and wrap Kafka consumer handlers in try/catch so a bad message is logged and discarded rather than crashing the service.

### Step 8: Connect Services with Kafka

1. Run Kafka locally via Docker (with Zookeeper if using a Kafka image that requires it, e.g. Confluent or Bitnami images; newer Kafka versions support KRaft mode without Zookeeper).
2. Create the required topics manually or let them auto-create on first publish:
   - `page_crawled`
   - `search_performed`
   - `result_clicked`
3. In the Crawler Service, confirm the producer from Step 3 is publishing correctly formatted JSON messages to `page_crawled`.
4. In the Indexer Service, confirm the consumer from Step 4 is correctly subscribed to `page_crawled` and processes each message exactly once (watch for consumer group configuration so messages are not reprocessed or skipped).
5. In the Search Service, add a Kafka producer that publishes to `search_performed` after every search request (query, result count, timestamp, optional `user_id`).
6. In the Analytics Service, add a Kafka consumer (via `@nestjs/microservices`'s Kafka transport, or `kafkajs` directly) subscribed to `search_performed` that writes to `search_logs` automatically instead of relying solely on the direct `POST /analytics/search` endpoint from Step 7.
7. Add a `result_clicked` publish step wherever click tracking happens (likely from the frontend calling a small endpoint, or directly from the Search Service if it proxies result clicks) and consume it in the Analytics Service the same way.
8. Add basic error handling and retry logic around Kafka producers/consumers on both stacks (e.g. catch connection errors on startup, since Kafka may take a few seconds longer to become ready than the services depending on it — `kafka-python`/`aiokafka` retry loops on the Python side, `KafkaJS`'s built-in retry config or a manual `onModuleInit` retry loop on the NestJS side).
9. Add a healthcheck or startup delay so dependent services wait for Kafka to be ready (Docker Compose `depends_on` with a healthcheck, or a simple retry loop on service startup).

### Step 9: Add the Nginx Gateway

1. Create a `gateway/` folder containing an `nginx.conf` file whose only job is routing incoming requests to the correct downstream service. Using Nginx instead of a hand-written proxy service keeps the gateway lightweight, fast, and free of application code to maintain.
2. Define upstream blocks and route mappings in `nginx.conf`:
   ```nginx
   events {}

   http {
       upstream search_service {
           server search-service:8000;
       }
       upstream auth_service {
           server auth-service:8000;
       }
       upstream analytics_service {
           server analytics-service:8000;
       }
       upstream crawler_service {
           server crawler-service:8000;
       }
       upstream indexer_service {
           server indexer-service:8000;
       }

       server {
           listen 80;

           location /search/ {
               proxy_pass http://search_service/;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
           }

           location /auth/ {
               proxy_pass http://auth_service/;
               proxy_set_header Host $host;
           }

           location /analytics/ {
               proxy_pass http://analytics_service/;
               proxy_set_header Host $host;
           }

           location /crawl/ {
               proxy_pass http://crawler_service/;
           }

           location /index/ {
               proxy_pass http://indexer_service/;
           }
       }
   }
   ```
3. Write a minimal `gateway/Dockerfile`:
   ```dockerfile
   FROM nginx:1.27-alpine
   COPY nginx.conf /etc/nginx/nginx.conf
   ```
4. (Optional, more advanced) Centralize JWT validation at the gateway level using Nginx's `auth_request` directive: point it at a small internal verification endpoint on the Auth Service (e.g. `GET /auth/verify`), and on success forward the decoded `user_id` to downstream services via a custom header (e.g. `X-User-Id`) using `auth_request_set` — so individual services do not need to re-verify JWTs themselves. If this feels like too much for the MVP, stick with each service verifying the shared `JWT_SECRET` independently (as set up in Step 6) and revisit this later.
5. Add basic access logging in `nginx.conf` (Nginx's default `access_log`/`error_log` directives already capture method, path, status code, and response time) since the gateway is the single entry point and a natural place for centralized observability.
6. Add CORS headers at the gateway level (via `add_header` directives, or the `nginx-cors` approach of handling `OPTIONS` preflight requests explicitly) so the frontend (running on a different port/origin) can call it without browser errors.
7. Confirm routing works by starting the gateway alongside the other services and hitting each `location` block manually (e.g. `curl http://localhost:8000/search/?q=test`) to verify traffic reaches the right downstream service.

### Step 10: Containerize Everything with Docker

1. Write a `Dockerfile` for each service following a consistent pattern per stack:
   - Python services (Search, Crawler, Indexer):
     ```dockerfile
     FROM python:3.11-slim
     WORKDIR /app
     COPY requirements.txt .
     RUN pip install --no-cache-dir -r requirements.txt
     COPY . .
     CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
     ```
   - NestJS services (Auth, Analytics), using a multi-stage build so `node_modules` dev dependencies and TypeScript source don't ship in the final image:
     ```dockerfile
     FROM node:20-slim AS build
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci
     COPY . .
     RUN npm run build

     FROM node:20-slim
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci --omit=dev
     COPY --from=build /app/dist ./dist
     CMD ["node", "dist/main.js"]
     ```
   - Gateway (Nginx): as defined in Step 9 (`FROM nginx:1.27-alpine`, copying in `nginx.conf`).
2. Write the root `docker-compose.yml` including:
   - `postgres` (with a named volume for data persistence)
   - `redis`
   - `kafka` (and `zookeeper` if required by the chosen image)
   - `search-service`, `crawler-service`, `indexer-service`, `auth-service`, `analytics-service`
   - `gateway` (Nginx)
3. Configure each service's environment variables in `docker-compose.yml` to reference container service names instead of `localhost` (e.g. `DATABASE_URL=postgresql://user:password@postgres:5432/search_engine`, `KAFKA_BROKER=kafka:9092`). The Nginx gateway's `upstream` blocks likewise reference the other services by their Docker Compose service names (e.g. `search-service`, `auth-service`), which Docker's internal DNS resolves automatically.
4. Add `depends_on` relationships so PostgreSQL, Redis, and Kafka start before the services that need them (note that `depends_on` alone does not guarantee readiness, only startup order, so retry logic in the app code is still important). Add the gateway's `depends_on` for all downstream services so Nginx doesn't fail its first proxy attempts before they're up.
5. Expose only the gateway's port to the host machine (e.g. `8000:80`, matching the `listen 80` in `nginx.conf`) and keep other services internal to the Docker network, since external clients should only talk to the gateway.
6. Run `docker compose up --build` and confirm all containers start without errors.
7. Run the Alembic migrations inside the appropriate container (or as a one-off `docker compose run` command) to create the database schema inside the containerized PostgreSQL instance.
8. Verify inter-service communication works from inside the Docker network (e.g. exec into a container and `curl` another service by its service name), and verify external routing works by hitting the exposed gateway port from the host (e.g. `curl http://localhost:8000/search/?q=test`).

### Step 11: Testing and Refinement

1. Write unit tests for pure logic functions first, since they need no external dependencies:
   - Tokenizer (Indexer/Search) — with `pytest`.
   - Scoring/ranking function (Search) — with `pytest`.
   - Password hashing and JWT generation/validation (Auth) — with Nest's built-in Jest setup (`*.spec.ts` files alongside each service/controller).
2. Write integration tests for endpoints:
   - Python services: use `pytest` and `httpx.AsyncClient` (or FastAPI's `TestClient`), ideally against a test database (a separate PostgreSQL database or schema, not production data).
   - NestJS services: use Nest's `@nestjs/testing` module (`Test.createTestingModule`) together with Jest and `supertest` for HTTP-level assertions, against the same kind of isolated test database.
   - Gateway: test the Nginx routing rules by sending requests through the gateway's exposed port and confirming they reach the correct downstream service (e.g. via `curl` or a small script hitting each `location` path).
3. Run a full manual end-to-end test:
   - Trigger the Crawler Service (through the gateway) to crawl a few pages.
   - Confirm rows appear in `pages`.
   - Confirm the Indexer Service consumes the events and populates `inverted_index`.
   - Run a search query through the gateway and confirm relevant results are returned.
   - Confirm a `search_performed` event reaches the Analytics Service and a row appears in `search_logs`.
4. Verify Redis caching is actually working: run the same search twice and confirm the second call is faster (or log a "cache hit"/"cache miss" message to confirm behavior directly).
5. Review Kafka consumer group behavior: restart the Indexer Service mid-crawl and confirm it resumes from the correct offset instead of reprocessing everything or skipping messages.
6. Load-test the Search Service (through the gateway) lightly (e.g. using `locust` or a simple script firing repeated requests) to see how it behaves under concurrent load, even at a small scale — this also indirectly tests how Nginx handles concurrent proxied connections.
7. Review logs across all services, including Nginx's `access_log`/`error_log`, for unhandled exceptions, proxy errors (e.g. `502 Bad Gateway` if a downstream service is unreachable), or silent failures, and add missing error handling where needed.

### Step 12: Optional Enhancements (After MVP)

1. Improve ranking beyond simple term frequency:
   - Implement TF-IDF (term frequency, inverse document frequency) so rare, distinctive words are weighted more heavily than common ones.
   - Optionally move toward BM25 for more accurate relevance ranking.
2. Add pagination metadata to the search response (`total_pages`, `has_next`, `has_previous`).
3. Add a simple frontend:
   - A single HTML page with a search box, results list, and login/register forms.
   - Use plain JavaScript with `fetch()` calls to the Nginx gateway, or a lightweight framework if preferred.
   - **Serve the static frontend files directly from Nginx** rather than from an application service: add a `frontend` container (or a second `location` block in the existing gateway) using the stock `nginx:1.27-alpine` image with the frontend's `index.html`/`app.js`/`styles.css` mounted or copied in, e.g.:
     ```yaml
     frontend:
       image: nginx:1.27-alpine
       volumes:
         - ./frontend:/usr/share/nginx/html:ro
       ports:
         - "3000:80"
     ```
     This keeps static asset serving fast and separate from API routing, without needing any application code just to serve HTML/JS/CSS.
4. Add health check endpoints (`/health`) to every service and wire them into Docker Compose healthchecks so failures are detected automatically. Add an Nginx healthcheck too (e.g. `curl -f http://localhost/health` against a trivial `location /health { return 200; }` block) so Compose can detect if the gateway itself goes down.
5. Add centralized logging (e.g. forward logs to a single place using `docker compose logs` initially, or a proper log aggregator later like Loki/ELK for a more advanced setup) — Nginx's `access_log` format can be customized to emit structured JSON logs to make this easier downstream.
6. Add rate limiting on the Search Service and Gateway to prevent abuse. At the gateway level, this is a natural fit for **Nginx's built-in `limit_req_zone`/`limit_req` directives** (a simple sliding-window-style limiter per IP), used instead of or alongside a Redis-based counter in the Search Service itself:
   ```nginx
   limit_req_zone $binary_remote_addr zone=search_limit:10m rate=10r/s;

   location /search/ {
       limit_req zone=search_limit burst=20 nodelay;
       proxy_pass http://search_service/;
   }
   ```
7. Add incremental re-crawling: track `crawled_at` timestamps and periodically re-crawl pages older than a set threshold to keep the index fresh.
8. Add basic monitoring (e.g. Prometheus + Grafana) to track request counts, latency, and error rates per service, once the core system is stable. Nginx exposes basic metrics via its `stub_status` module, which can be scraped by an `nginx-prometheus-exporter` sidecar to fold gateway-level metrics into the same dashboard.
9. Add TLS termination at the gateway: since Nginx already sits at the edge, adding an SSL certificate (e.g. via Let's Encrypt/Certbot) and a `listen 443 ssl;` block here is a natural next step once the project is exposed beyond localhost.

---

## Suggested Build Order Summary

1. Project setup and folder structure
2. Database and Redis setup
3. Crawler Service (standalone, no dependencies on other services yet)
4. Indexer Service (depends on Crawler output)
5. Search Service (depends on Indexer output)
6. Auth Service (independent, can be built in parallel)
7. Analytics Service (independent, can be built in parallel)
8. Connect everything through Kafka
9. Add the Nginx Gateway
10. Dockerize and run the full stack together
11. Test end to end
12. Add optional enhancements (including serving the frontend via Nginx, and gateway-level rate limiting/TLS)
