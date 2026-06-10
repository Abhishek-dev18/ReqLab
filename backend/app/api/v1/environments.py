from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.environment import Environment
from app.models.user import User
from app.schemas.environment import EnvironmentCreate, EnvironmentResponse, EnvironmentUpdate

router = APIRouter()


async def _get_environment(env_id: int, user_id: int, db: AsyncSession) -> Environment:
    result = await db.execute(
        select(Environment).where(Environment.id == env_id, Environment.owner_id == user_id)
    )
    env = result.scalar_one_or_none()
    if not env:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environment not found")
    return env


@router.get("", response_model=list[EnvironmentResponse])
async def list_environments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Environment]:
    result = await db.execute(
        select(Environment).where(Environment.owner_id == current_user.id).order_by(Environment.name)
    )
    return list(result.scalars().all())


@router.post("", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
async def create_environment(
    payload: EnvironmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Environment:
    env = Environment(
        name=payload.name,
        variables=payload.variables,
        is_global=payload.is_global,
        owner_id=current_user.id,
        collection_id=payload.collection_id,
    )
    db.add(env)
    await db.flush()
    await db.refresh(env)
    return env


@router.get("/{environment_id}", response_model=EnvironmentResponse)
async def get_environment(
    environment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Environment:
    return await _get_environment(environment_id, current_user.id, db)


@router.put("/{environment_id}", response_model=EnvironmentResponse)
async def update_environment(
    environment_id: int,
    payload: EnvironmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Environment:
    env = await _get_environment(environment_id, current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(env, field, value)
    await db.flush()
    await db.refresh(env)
    return env


@router.delete("/{environment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_environment(
    environment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    env = await _get_environment(environment_id, current_user.id, db)
    await db.delete(env)
