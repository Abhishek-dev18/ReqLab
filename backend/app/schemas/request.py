from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AssertionCreate(BaseModel):
    assertion_type: str = Field(description="status_equals, response_time_lt, json_field_exists, json_field_equals")
    target: str | None = None
    expected_value: str | None = None


class AssertionResponse(BaseModel):
    id: int
    assertion_type: str
    target: str | None
    expected_value: str | None

    model_config = {"from_attributes": True}


class RequestCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    method: str = "GET"
    url: str = ""
    headers: dict[str, str] = Field(default_factory=dict)
    query_params: dict[str, str] = Field(default_factory=dict)
    body_type: str = "none"
    body: str | None = None
    auth_type: str = "none"
    auth_config: dict[str, Any] = Field(default_factory=dict)
    folder_id: int | None = None
    sort_order: int = 0
    assertions: list[AssertionCreate] = Field(default_factory=list)


class RequestUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    method: str | None = None
    url: str | None = None
    headers: dict[str, str] | None = None
    query_params: dict[str, str] | None = None
    body_type: str | None = None
    body: str | None = None
    auth_type: str | None = None
    auth_config: dict[str, Any] | None = None
    folder_id: int | None = None
    sort_order: int | None = None
    assertions: list[AssertionCreate] | None = None


class RequestResponse(BaseModel):
    id: int
    name: str
    method: str
    url: str
    headers: dict[str, str]
    query_params: dict[str, str]
    body_type: str
    body: str | None
    auth_type: str
    auth_config: dict[str, Any]
    collection_id: int
    folder_id: int | None
    sort_order: int
    assertions: list[AssertionResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExecuteRequestPayload(BaseModel):
    method: str
    url: str
    headers: dict[str, str] = Field(default_factory=dict)
    query_params: dict[str, str] = Field(default_factory=dict)
    body_type: str = "none"
    body: str | None = None
    auth_type: str = "none"
    auth_config: dict[str, Any] = Field(default_factory=dict)
    environment_id: int | None = None
    collection_id: int | None = None
    request_id: int | None = None
    assertions: list[AssertionCreate] = Field(default_factory=list)
    save_history: bool = True


class AssertionResult(BaseModel):
    assertion_type: str
    target: str | None
    expected_value: str | None
    passed: bool
    message: str


class ExecuteResponse(BaseModel):
    status_code: int
    response_time_ms: int
    headers: dict[str, str]
    body: str
    content_type: str | None
    assertion_results: list[AssertionResult] = Field(default_factory=list)
    history_id: int | None = None
