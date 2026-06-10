from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.collection import Collection
from app.models.history import History
from app.models.request import Request
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.schemas.history import HistoryResponse

router = APIRouter()


@router.get("", response_model=DashboardStats)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardStats:
    collections_count = await db.scalar(
        select(func.count()).select_from(Collection).where(Collection.owner_id == current_user.id)
    )
    requests_count = await db.scalar(
        select(func.count())
        .select_from(Request)
        .join(Collection)
        .where(Collection.owner_id == current_user.id)
    )

    history_result = await db.execute(
        select(History)
        .where(History.user_id == current_user.id)
        .order_by(History.created_at.desc())
        .limit(10)
    )
    recent = history_result.scalars().all()

    return DashboardStats(
        total_collections=collections_count or 0,
        total_requests=requests_count or 0,
        recent_activity=[HistoryResponse.model_validate(h) for h in recent],
    )
