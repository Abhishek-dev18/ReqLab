import json
from typing import Any

from app.schemas.request import AssertionCreate, AssertionResult


def _get_json_path(data: Any, path: str) -> Any:
    current = data
    for part in path.split("."):
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current


def evaluate_assertions(
    assertions: list[AssertionCreate],
    status_code: int,
    response_time_ms: int,
    body: str,
    error: str | None = None,
) -> list[AssertionResult]:
    results: list[AssertionResult] = []

    for assertion in assertions:
        atype = assertion.assertion_type
        target = assertion.target
        expected = assertion.expected_value

        if atype == "status_equals":
            try:
                expected_status = int(expected or "0")
                passed = status_code == expected_status
                message = f"Status {status_code} == {expected_status}" if passed else f"Expected {expected_status}, got {status_code}"
            except ValueError:
                passed = False
                message = "Invalid expected status code"
            results.append(
                AssertionResult(
                    assertion_type=atype,
                    target=target,
                    expected_value=expected,
                    passed=passed,
                    message=message,
                )
            )
        elif atype == "response_time_lt":
            try:
                threshold = int(expected or "0")
                passed = response_time_ms < threshold
                message = (
                    f"Response time {response_time_ms}ms < {threshold}ms"
                    if passed
                    else f"Response time {response_time_ms}ms >= {threshold}ms"
                )
            except ValueError:
                passed = False
                message = "Invalid response time threshold"
            results.append(
                AssertionResult(
                    assertion_type=atype,
                    target=target,
                    expected_value=expected,
                    passed=passed,
                    message=message,
                )
            )
        elif atype in ("json_field_exists", "json_field_equals"):
            if error:
                results.append(
                    AssertionResult(
                        assertion_type=atype,
                        target=target,
                        expected_value=expected,
                        passed=False,
                        message=f"Request failed: {error}",
                    )
                )
                continue
            try:
                parsed = json.loads(body) if body else None
            except json.JSONDecodeError:
                results.append(
                    AssertionResult(
                        assertion_type=atype,
                        target=target,
                        expected_value=expected,
                        passed=False,
                        message="Response body is not valid JSON",
                    )
                )
                continue

            field_value = _get_json_path(parsed, target or "")
            if atype == "json_field_exists":
                passed = field_value is not None
                message = f"Field '{target}' exists" if passed else f"Field '{target}' not found"
            else:
                passed = str(field_value) == str(expected)
                message = (
                    f"Field '{target}' equals '{expected}'"
                    if passed
                    else f"Field '{target}' is '{field_value}', expected '{expected}'"
                )
            results.append(
                AssertionResult(
                    assertion_type=atype,
                    target=target,
                    expected_value=expected,
                    passed=passed,
                    message=message,
                )
            )

    return results
