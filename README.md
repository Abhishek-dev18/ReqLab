# ReqLab

A modern, open-source, browser-based API development and testing platform inspired by Postman and Bruno — built web-first with clean architecture and future extensibility.

![Dashboard](docs/images/dashboard-placeholder.png)

## Features

### Implemented

- **Authentication** — Register, login, logout with JWT access & refresh tokens
- **Collections** — Organize requests in folders with a tree structure
- **Request Builder** — GET, POST, PUT, PATCH, DELETE with headers, query params, body types, and auth
- **Environment Variables** — Global and collection-scoped `{{variable}}` substitution
- **Response Viewer** — Status, timing, headers, pretty/raw JSON body
- **Assertions (Tests)** — Status, response time, JSON field checks
- **Request History** — Track and review past executions
- **OpenAPI Import** — Auto-generate collections from OpenAPI 3.x specs
- **Docker** — Single-command self-hosted deployment

### Not yet implemented

The following are **planned** but **not available** in the current version:

| Feature | Status |
|---------|--------|
| **Load testing** | Not implemented — no backend routes, UI, or scheduler exist yet |
| SOAP / GraphQL / gRPC | Not implemented |
| Team collaboration | Not implemented |
| Local agent (localhost/private network) | Stub only (`LocalAgentRequestExecutor`) |
| AI-powered testing | Not implemented |

> **Note on load testing:** ReqLab is inspired by tools like JMeter, but load testing is only on the roadmap. There is no way to run concurrent/virtual-user tests in the app today. Single-request execution via `POST /api/v1/execute` is the only execution mode.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, TailwindCSS, React Query, Zustand |
| Backend | FastAPI, Python 3.12+, SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Cache | Redis (connected; reserved for future use) |
| HTTP Engine | httpx |

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

- **App (UI):** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

Register an account on first launch, then open **Collections** to build and send requests.

### Local Development

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Start PostgreSQL and Redis (or: docker compose up postgres redis -d)
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
ReqLab/
├── frontend/          # React SPA (Postman-inspired UI)
├── backend/           # FastAPI application
├── docs/              # Documentation
├── scripts/           # Dev scripts
└── docker-compose.yml
```

## Documentation

- [Setup Guide](docs/setup.md)
- [Development Guide](docs/development.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)

## Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Architecture Highlights

### RequestExecutor Abstraction

The backend uses a `RequestExecutor` interface to support future **Local Agent** execution for localhost and private network access:

```python
class RequestExecutor(ABC):
    async def execute(self, request: ExecutionRequest) -> ExecutionResult: ...
    async def validate(self, request: ExecutionRequest) -> list[str]: ...
    async def cancel(self, execution_id: str) -> bool: ...
```

- **Current:** `ServerRequestExecutor` (httpx) — single HTTP request per call
- **Future:** `LocalAgentRequestExecutor`, load-test scheduler + executor

## License

Open Source — MIT