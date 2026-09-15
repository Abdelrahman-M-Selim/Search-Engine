# Search Service - Getting Started and Run Guide

Step-by-step guide to run and test the **Search Service** locally or using Docker without requiring a database or Redis instance.

---

## 1. Run Locally with Python

### Step 1: Navigate to the service directory
Open your terminal and navigate to `search-service`:

```bash
cd search-service
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
From the `search-service` directory:
```bash
docker build -t search-service .
```

### Step 2: Run the container
```bash
docker run -p 8000:8000 --name search-service-app search-service
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
    "service": "search-service",
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
    "service": "search-service",
    "version": "0.1.0"
  }
  ```

#### 3. Search Query Endpoint
- **URL:** `http://127.0.0.1:8000/search?q=fastapi&page=1&limit=10`
- **PowerShell:**
  ```powershell
  Invoke-RestMethod -Uri "http://127.0.0.1:8000/search?q=fastapi&page=1&limit=10" -Method GET
  ```
- **Expected Response:**
  ```json
  {
    "query": "fastapi",
    "total_results": 0,
    "page": 1,
    "limit": 10,
    "results": []
  }
  ```

---

> [!NOTE]
> On startup, you will see a warning in the logs:
> `Redis connection failed on startup. Service will fail-open...`
> This is expected because Redis is not running yet; the service is configured to continue operating safely without it during this stage.
