from app.schemas.request import AssertionCreate
from app.services.assertion_engine import evaluate_assertions
from app.services.variable_substitution import substitute_variables


def test_substitute_variables():
    result = substitute_variables("{{base_url}}/users", {"base_url": "https://api.example.com"})
    assert result == "https://api.example.com/users"


def test_substitute_variables_missing():
    result = substitute_variables("{{unknown}}", {"base_url": "https://api.example.com"})
    assert result == "{{unknown}}"


def test_status_assertion_pass():
    results = evaluate_assertions(
        [AssertionCreate(assertion_type="status_equals", expected_value="200")],
        status_code=200,
        response_time_ms=100,
        body='{"ok": true}',
    )
    assert results[0].passed is True


def test_status_assertion_fail():
    results = evaluate_assertions(
        [AssertionCreate(assertion_type="status_equals", expected_value="200")],
        status_code=404,
        response_time_ms=100,
        body="",
    )
    assert results[0].passed is False


def test_json_field_exists():
    results = evaluate_assertions(
        [AssertionCreate(assertion_type="json_field_exists", target="data.id")],
        status_code=200,
        response_time_ms=50,
        body='{"data": {"id": 1}}',
    )
    assert results[0].passed is True


def test_response_time_assertion():
    results = evaluate_assertions(
        [AssertionCreate(assertion_type="response_time_lt", expected_value="1000")],
        status_code=200,
        response_time_ms=500,
        body="",
    )
    assert results[0].passed is True
