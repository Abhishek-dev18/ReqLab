import re
from typing import Any

VARIABLE_PATTERN = re.compile(r"\{\{(\s*[\w.-]+\s*)\}\}")


def substitute_variables(value: str, variables: dict[str, str]) -> str:
    if not value or not variables:
        return value

    def replacer(match: re.Match[str]) -> str:
        key = match.group(1).strip()
        return variables.get(key, match.group(0))

    return VARIABLE_PATTERN.sub(replacer, value)


def substitute_dict(data: dict[str, str], variables: dict[str, str]) -> dict[str, str]:
    return {k: substitute_variables(v, variables) for k, v in data.items()}


def apply_variables_to_request(
    url: str,
    headers: dict[str, str],
    query_params: dict[str, str],
    body: str | None,
    auth_config: dict[str, Any],
    variables: dict[str, str],
) -> tuple[str, dict[str, str], dict[str, str], str | None, dict[str, Any]]:
    substituted_auth = {
        k: substitute_variables(v, variables) if isinstance(v, str) else v
        for k, v in auth_config.items()
    }
    return (
        substitute_variables(url, variables),
        substitute_dict(headers, variables),
        substitute_dict(query_params, variables),
        substitute_variables(body, variables) if body else body,
        substituted_auth,
    )
