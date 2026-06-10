"""Request execution abstraction layer.

Current: Server-side execution via httpx.
Future: Local Agent execution for private network / localhost access.
"""

import base64
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

import httpx

from app.core.config import get_settings

settings = get_settings()


@dataclass
class ExecutionRequest:
    method: str
    url: str
    headers: dict[str, str]
    query_params: dict[str, str]
    body_type: str
    body: str | None
    auth_type: str
    auth_config: dict[str, Any]
    timeout: float = settings.REQUEST_TIMEOUT_SECONDS


@dataclass
class ExecutionResult:
    status_code: int
    response_time_ms: int
    headers: dict[str, str]
    body: str
    content_type: str | None
    error: str | None = None


class RequestExecutor(ABC):
    """Abstract request executor interface for server and future local agent."""

    @abstractmethod
    async def execute(self, request: ExecutionRequest) -> ExecutionResult:
        pass

    @abstractmethod
    async def validate(self, request: ExecutionRequest) -> list[str]:
        pass

    @abstractmethod
    async def cancel(self, execution_id: str) -> bool:
        pass


class ServerRequestExecutor(RequestExecutor):
    """Server-side HTTP execution using httpx."""

    def __init__(self) -> None:
        self._active_tasks: dict[str, bool] = {}

    def _apply_auth(self, headers: dict[str, str], auth_type: str, auth_config: dict[str, Any]) -> dict[str, str]:
        result = dict(headers)
        if auth_type == "bearer":
            token = auth_config.get("token", "")
            if token:
                result["Authorization"] = f"Bearer {token}"
        elif auth_type == "basic":
            username = auth_config.get("username", "")
            password = auth_config.get("password", "")
            encoded = base64.b64encode(f"{username}:{password}".encode()).decode()
            result["Authorization"] = f"Basic {encoded}"
        elif auth_type == "api_key":
            key_name = auth_config.get("key_name", "X-API-Key")
            key_value = auth_config.get("key_value", "")
            location = auth_config.get("location", "header")
            if location == "header" and key_value:
                result[key_name] = key_value
        return result

    def _build_body(
        self, body_type: str, body: str | None, auth_type: str, auth_config: dict[str, Any]
    ) -> tuple[str | bytes | None, dict[str, str]]:
        extra_headers: dict[str, str] = {}
        if not body or body_type == "none":
            return None, extra_headers

        if body_type == "json":
            extra_headers["Content-Type"] = "application/json"
            return body, extra_headers
        if body_type == "text":
            extra_headers["Content-Type"] = "text/plain"
            return body, extra_headers
        if body_type == "form":
            extra_headers["Content-Type"] = "multipart/form-data"
            return body, extra_headers
        if body_type == "x-www-form-urlencoded":
            extra_headers["Content-Type"] = "application/x-www-form-urlencoded"
            return body, extra_headers

        return body, extra_headers

    async def validate(self, request: ExecutionRequest) -> list[str]:
        errors: list[str] = []
        if not request.url:
            errors.append("URL is required")
        elif not request.url.startswith(("http://", "https://")):
            errors.append("URL must start with http:// or https://")
        if request.method not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
            errors.append(f"Unsupported method: {request.method}")
        return errors

    async def execute(self, request: ExecutionRequest) -> ExecutionResult:
        errors = await self.validate(request)
        if errors:
            return ExecutionResult(
                status_code=0,
                response_time_ms=0,
                headers={},
                body="",
                content_type=None,
                error="; ".join(errors),
            )

        headers = self._apply_auth(request.headers, request.auth_type, request.auth_config)
        content, body_headers = self._build_body(
            request.body_type, request.body, request.auth_type, request.auth_config
        )
        headers.update(body_headers)

        params = dict(request.query_params)
        if request.auth_type == "api_key" and request.auth_config.get("location") == "query":
            key_name = request.auth_config.get("key_name", "api_key")
            key_value = request.auth_config.get("key_value", "")
            if key_value:
                params[key_name] = key_value

        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=request.timeout) as client:
                response = await client.request(
                    method=request.method.upper(),
                    url=request.url,
                    headers=headers,
                    params=params,
                    content=content,
                )
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return ExecutionResult(
                status_code=response.status_code,
                response_time_ms=elapsed_ms,
                headers=dict(response.headers),
                body=response.text,
                content_type=response.headers.get("content-type"),
            )
        except httpx.TimeoutException:
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return ExecutionResult(
                status_code=0,
                response_time_ms=elapsed_ms,
                headers={},
                body="",
                content_type=None,
                error="Request timed out",
            )
        except httpx.RequestError as exc:
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            return ExecutionResult(
                status_code=0,
                response_time_ms=elapsed_ms,
                headers={},
                body="",
                content_type=None,
                error=str(exc),
            )

    async def cancel(self, execution_id: str) -> bool:
        if execution_id in self._active_tasks:
            self._active_tasks[execution_id] = False
            return True
        return False


class LocalAgentRequestExecutor(RequestExecutor):
    """Placeholder for future local agent execution."""

    async def validate(self, request: ExecutionRequest) -> list[str]:
        raise NotImplementedError("Local agent execution is not yet implemented")

    async def execute(self, request: ExecutionRequest) -> ExecutionResult:
        raise NotImplementedError("Local agent execution is not yet implemented")

    async def cancel(self, execution_id: str) -> bool:
        raise NotImplementedError("Local agent execution is not yet implemented")


def get_request_executor(executor_type: str = "server") -> RequestExecutor:
    if executor_type == "local_agent":
        return LocalAgentRequestExecutor()
    return ServerRequestExecutor()
