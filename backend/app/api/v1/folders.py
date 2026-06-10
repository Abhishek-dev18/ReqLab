from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.folder import Folder
from app.models.user import User
from app.schemas.collection import FolderResponse, FolderUpdate

router = APIRouter()


async def _get_folder(folder_id: int, user_id: int, db: AsyncSession) -> Folder:
    result = await db.execute(
        select(Folder)
        .join(Folder.collection)
        .where(Folder.id == folder_id, Folder.collection.has(owner_id=user_id))
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    payload: FolderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Folder:
    folder = await _get_folder(folder_id, current_user.id, db)
    if payload.name is not None:
        folder.name = payload.name
    if payload.parent_id is not None:
        folder.parent_id = payload.parent_id
    if payload.sort_order is not None:
        folder.sort_order = payload.sort_order
    await db.flush()
    await db.refresh(folder)
    return folder


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    folder = await _get_folder(folder_id, current_user.id, db)
    await db.delete(folder)
