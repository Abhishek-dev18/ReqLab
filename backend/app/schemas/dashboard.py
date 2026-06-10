from datetime import datetime

from pydantic import BaseModel

from app.schemas.history import HistoryResponse


class DashboardStats(BaseModel):
    total_collections: int
    total_requests: int
    recent_activity: list[HistoryResponse]
