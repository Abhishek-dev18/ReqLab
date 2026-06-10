# API Documentation

Base URL: `http://localhost:8000/api/v1`

Interactive docs: http://localhost:8000/docs

## Authentication

All endpoints except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <access_token>
```

### POST /auth/register

Register a new user.

```json
{
  "email": "user@example.com",
  "username": "developer",
  "password": "securepass123"
}
```

### POST /auth/login

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### POST /auth/refresh

```json
{ "refresh_token": "..." }
```

### POST /auth/logout

Invalidate session (client-side token removal).

### GET /auth/me

Returns current user profile.

---

## Dashboard

### GET /dashboard

Returns `total_collections`, `total_requests`, `recent_activity`.

---

## Collections

| Method | Path | Description |
|--------|------|-------------|
| GET | `/collections` | List collections |
| POST | `/collections` | Create collection |
| GET | `/collections/{id}` | Get collection |
| PUT | `/collections/{id}` | Update collection |
| DELETE | `/collections/{id}` | Delete collection |
| GET | `/collections/{id}/tree` | Get folders + requests tree |
| POST | `/collections/{id}/folders` | Create folder |

---

## Requests

| Method | Path | Description |
|--------|------|-------------|
| POST | `/requests/collections/{id}/requests` | Create request |
| GET | `/requests/{id}` | Get request |
| PUT | `/requests/{id}` | Update request |
| DELETE | `/requests/{id}` | Delete request |

---

## Execute

### POST /execute

Execute an HTTP request server-side.

```json
{
  "method": "GET",
  "url": "{{base_url}}/users",
  "headers": {},
  "query_params": {},
  "body_type": "none",
  "body": null,
  "auth_type": "bearer",
  "auth_config": { "token": "{{token}}" },
  "environment_id": 1,
  "collection_id": 1,
  "assertions": [
    { "assertion_type": "status_equals", "expected_value": "200" }
  ],
  "save_history": true
}
```

---

## Environments

| Method | Path | Description |
|--------|------|-------------|
| GET | `/environments` | List environments |
| POST | `/environments` | Create environment |
| PUT | `/environments/{id}` | Update environment |
| DELETE | `/environments/{id}` | Delete environment |

---

## History

| Method | Path | Description |
|--------|------|-------------|
| GET | `/history?limit=50` | List history |
| GET | `/history/{id}` | Get entry |
| DELETE | `/history/{id}` | Delete entry |

---

## OpenAPI

### POST /openapi/import

```json
{
  "content": "openapi: 3.0.0\n...",
  "collection_name": "Optional Override"
}
```

---

## Assertion Types

| Type | Fields | Example |
|------|--------|---------|
| `status_equals` | `expected_value` | `"200"` |
| `response_time_lt` | `expected_value` | `"1000"` (ms) |
| `json_field_exists` | `target` | `"data.id"` |
| `json_field_equals` | `target`, `expected_value` | `"data.status"`, `"ok"` |

---

## Health

### GET /health

Returns service status and Redis connectivity.
