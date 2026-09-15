# Indexer Service - Getting Started and Run Guide

Step-by-step guide to run and test the **Indexer Service** locally or using Docker without requiring a live database or Kafka instance.

---

## 1. Run Locally with Python

### Step 1: Navigate to the service directory
Open your terminal and navigate to `indexer-service`:

```bash
cd indexer-service
```

### Step 2: Create and activate a virtual environment

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(Note: Do not use `source` on Windows. If PowerShell blocks script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, then run `.\venv\Scripts\Activate.ps1`)*

**On Windows (Command Prompt - CMD):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: (Optional) Set up environment file
The service has built-in defaults, but you can create a local `.env` file if needed:

**Windows:**
```powershell
copy .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

### Step 5: Start the development server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at: `http://127.0.0.1:8000`

---

## 2. Run with Docker

### Step 1: Build the Docker image
From the `indexer-service` directory:
```bash
docker build -t indexer-service .
```

### Step 2: Run the container
```bash
docker run -p 8000:8000 --name indexer-service-app indexer-service
```

---

## 3. Testing the Endpoints

### Option A: Interactive Swagger UI
Open your browser and go to:
- `http://127.0.0.1:8000/docs`

You can test all endpoints directly using the **Try it out** button.

---

### Option B: Test via Browser or PowerShell / cURL

#### 1. Root Endpoint
- **URL:** `http://127.0.0.1:8000/`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/" -Method GET
  ```
- **Expected Response:**
  ```json
  {
    "service": "indexer-service",
    "environment": "development",
    "status": "online",
    "docs": "/docs"
  }
  ```

#### 2. Health Check Endpoint
- **URL:** `http://127.0.0.1:8000/health`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method GET
  ```
- **Expected Response:**
  ```json
  {
    "status": "healthy",
    "service": "indexer-service",
    "version": "0.1.0"
  }
  ```

#### 3. Index Status Endpoint
- **URL:** `http://127.0.0.1:8000/index/status`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/index/status" -Method GET
  ```
- **Expected Response:**
  ```json
  {
    "service": "indexer-service",
    "status": "online",
    "total_indexed_pages": 0,
    "total_unique_terms": 0,
    "database_connected": false,
    "kafka_connected": false
  }
  ```

#### 4. Tokenize Debug Endpoint
- **URL:** `http://127.0.0.1:8000/index/tokenize`
- **PowerShell:**
  ```powershell
  $body = @{ text = "FastAPI and Python for building fast search engine indexes!" } | ConvertTo-Json
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/index/tokenize" -Method POST -Body $body -ContentType "application/json"
  ```
- **Expected Response:**
  ```json
  {
    "raw_text": "FastAPI and Python for building fast search engine indexes!",
    "token_count": 6,
    "unique_terms_count": 6,
    "tokens": ["fastapi", "python", "building", "fast", "search", "engine", "indexes"],
    "term_frequencies": {
      "fastapi": 1,
      "python": 1,
      "building": 1,
      "fast": 1,
      "search": 1,
      "engine": 1,
      "indexes": 1
    }
  }
  ```

#### 5. Manual Page Indexing Endpoint
- **URL:** `http://127.0.0.1:8000/index/page`
- **PowerShell:**
  ```powershell
  $body = @{
    page_id = 1
    url = "https://fastapi.tiangolo.com"
    title = "FastAPI Framework"
    content = "FastAPI is a modern, fast web framework for building APIs with Python."
  } | ConvertTo-Json
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/index/page" -Method POST -Body $body -ContentType "application/json"
  ```
- **Expected Response:**
  ```json
  {
    "page_id": 1,
    "url": "https://fastapi.tiangolo.com",
    "unique_terms_count": 8,
    "status": "success_memory_only",
    "message": "Indexed in-memory (DB offline)"
  }
  ```

---

> [!NOTE]
> On startup without PostgreSQL or Kafka running, you will see warnings in the logs:
> `PostgreSQL connection failed on startup... Service will operate in degraded/fail-open mode.`
> `Kafka connection failed or dropped... Retrying in 10 seconds...`
> This is expected because neither Postgres nor Kafka are running yet; the service is configured to continue operating safely without them during local development and testing.
