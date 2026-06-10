from datetime import datetime
from typing import Any

from pydantic import BaseModel


class HistoryResponse(BaseModel):
    id: int
    method: str
    url: str
    status_code: int | None
    response_time_ms: int | None
    request_snapshot: dict[str, Any]
    response_snapshot: dict[str, Any]
    assertion_results: list
    request_id: int | None
    collection_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
