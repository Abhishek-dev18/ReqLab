# Setup Guide

## Prerequisites

- Docker & Docker Compose (recommended)
- OR: Node.js 20+, Python 3.12+, PostgreSQL 16, Redis 7

## Docker Setup

1. Clone the repository
2. Run:

```bash
docker compose up --build
```

3. Open http://localhost
4. Register a new account and start testing APIs

### Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://apistudio:apistudio@postgres:5432/apistudio` | PostgreSQL connection |
| `REDIS_URL` | `redis://redis:6379/0` | Redis connection |
| `SECRET_KEY` | (required in prod) | JWT signing key |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed origins JSON array |

Copy `backend/.env.example` to `backend/.env` for local development.

## Manual Setup

### 1. Database

```bash
createdb apistudio
# Or use Docker for postgres only:
docker compose up postgres redis -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Screenshots

<!-- Placeholder for setup verification screenshot -->
![Setup Complete](images/setup-placeholder.png)

## Troubleshooting

- **Database connection errors:** Ensure PostgreSQL is running and `DATABASE_URL` is correct
- **CORS errors:** Add your frontend URL to `CORS_ORIGINS`
- **Migration errors:** Run `alembic upgrade head` from the `backend` directory
