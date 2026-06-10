import json
from typing import Any

import yaml

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options"}


def parse_openapi_spec(content: str) -> tuple[dict[str, Any], str]:
    content = content.strip()
    try:
        spec = json.loads(content)
        return spec, "json"
    except json.JSONDecodeError:
        pass

    try:
        spec = yaml.safe_load(content)
        if not isinstance(spec, dict):
            raise ValueError("YAML spec must be a mapping")
        return spec, "yaml"
    except yaml.YAMLError as exc:
        raise ValueError(f"Invalid OpenAPI spec: {exc}") from exc


def _resolve_ref(spec: dict[str, Any], ref: str) -> dict[str, Any]:
    if not ref.startswith("#/"):
        return {}
    parts = ref[2:].split("/")
    current: Any = spec
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return {}
    return current if isinstance(current, dict) else {}


def _build_request_body_example(operation: dict[str, Any], spec: dict[str, Any]) -> tuple[str, str | None]:
    request_body = operation.get("requestBody")
    if not request_body:
        return "none", None

    content = request_body.get("content", {})
    if "application/json" in content:
        schema = content["application/json"].get("schema", {})
        if "$ref" in schema:
            schema = _resolve_ref(spec, schema["$ref"])
        example = content["application/json"].get("example")
        if example is None and "example" in schema:
            example = schema.get("example")
        if example is not None:
            return "json", json.dumps(example, indent=2)
        return "json", "{}"
    if "text/plain" in content:
        return "text", ""
    if "application/x-www-form-urlencoded" in content:
        return "x-www-form-urlencoded", ""
    if "multipart/form-data" in content:
        return "form", ""
    return "none", None


def _build_parameters(operation: dict[str, Any], spec: dict[str, Any]) -> tuple[dict[str, str], dict[str, str]]:
    headers: dict[str, str] = {}
    query_params: dict[str, str] = {}
    for param in operation.get("parameters", []):
        if "$ref" in param:
            param = _resolve_ref(spec, param["$ref"])
        location = param.get("in")
        name = param.get("name", "")
        example = param.get("example") or param.get("schema", {}).get("default", "")
        if location == "header":
            headers[name] = str(example) if example is not None else ""
        elif location == "query":
            query_params[name] = str(example) if example is not None else ""
    return headers, query_params


def extract_endpoints(spec: dict[str, Any]) -> list[dict[str, Any]]:
    openapi_version = spec.get("openapi", "")
    if not str(openapi_version).startswith("3.") and "swagger" not in spec:
        raise ValueError("Only OpenAPI 3.x specifications are supported")

    base_url = ""
    servers = spec.get("servers", [])
    if servers:
        base_url = servers[0].get("url", "")

    endpoints: list[dict[str, Any]] = []
    paths = spec.get("paths", {})

    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in HTTP_METHODS:
                continue
            if not isinstance(operation, dict):
                continue

            tags = operation.get("tags", ["Default"])
            folder_name = tags[0] if tags else "Default"
            summary = operation.get("summary") or operation.get("operationId") or f"{method.upper()} {path}"
            headers, query_params = _build_parameters(operation, spec)
            body_type, body = _build_request_body_example(operation, spec)

            url = f"{base_url.rstrip('/')}{path}" if base_url else path
            endpoints.append(
                {
                    "folder": folder_name,
                    "name": summary,
                    "method": method.upper(),
                    "url": url,
                    "headers": headers,
                    "query_params": query_params,
                    "body_type": body_type,
                    "body": body,
                }
            )

    return endpoints
