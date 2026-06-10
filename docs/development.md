# Development Guide

## Getting Started

1. Fork and clone the repository
2. Start infrastructure: `docker compose up postgres redis -d`
3. Run backend and frontend in separate terminals (see [Setup Guide](setup.md))

## Code Style

- **Python:** Follow PEP 8, use type hints, async SQLAlchemy patterns
- **TypeScript:** Strict mode, functional React components, Zustand for client state
- **API:** Versioned under `/api/v1/`, RESTful resource naming

## Running Tests

```bash
# Backend unit tests
cd backend
pytest -v

# Frontend unit tests
cd frontend
npm test
```

## Database Migrations

Create a new migration after model changes:

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Adding a New API Endpoint

1. Define Pydantic schemas in `backend/app/schemas/`
2. Add route in `backend/app/api/v1/`
3. Register router in `backend/app/api/v1/__init__.py`
4. Add frontend API method in `frontend/src/api/index.ts`
5. Build UI component/page

## RequestExecutor Extension

To add Local Agent support in the future:

1. Implement `LocalAgentRequestExecutor` in `backend/app/services/request_executor.py`
2. Add WebSocket or gRPC channel for agent communication
3. Update `get_request_executor()` factory to route based on user preference
4. Add agent connection UI in frontend

## Screenshots

![Request Builder](images/builder-placeholder.png)
