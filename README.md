# API Studio OSS

A modern, open-source, browser-based API development and testing platform inspired by Postman, Bruno, SoapUI, and JMeter — built web-first with clean architecture and future extensibility.

![Dashboard](docs/images/dashboard-placeholder.png)

## Features

- **Authentication** — Register, login, logout with JWT access & refresh tokens
- **Collections** — Organize requests in folders with a tree structure
- **Request Builder** — GET, POST, PUT, PATCH, DELETE with headers, query params, body types, and auth
- **Environment Variables** — Global and collection-scoped `{{variable}}` substitution
- **Response Viewer** — Status, timing, headers, pretty/raw JSON body
- **Assertions** — Status, response time, JSON field checks
- **Request History** — Track and review past executions
- **OpenAPI Import** — Auto-generate collections from OpenAPI 3.x specs
- **Docker** — Single-command self-hosted deployment

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, TailwindCSS, React Query, Zustand |
| Backend | FastAPI, Python 3.12+, SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Cache | Redis (ready for future use) |
| HTTP Engine | httpx |

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Local Development

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Start PostgreSQL and Redis (or use docker compose up postgres redis)
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
api-studio-oss/
├── frontend/          # React SPA
├── backend/           # FastAPI application
├── docker/            # Shared Docker configs
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

Current implementation: `ServerRequestExecutor` (httpx).  
Future: `LocalAgentRequestExecutor` for client-side execution.

### Future Roadmap (Not Implemented)

- Load testing
- SOAP / GraphQL / gRPC support
- Team collaboration
- AI-powered testing

## License

Open Source — MIT (or your chosen license)
