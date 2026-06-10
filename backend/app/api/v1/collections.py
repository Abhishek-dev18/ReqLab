from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.collection import Collection
from app.models.request import Request as ApiRequest
from app.models.user import User
from app.models.folder import Folder
from app.schemas.collection import (
    CollectionCreate,
    CollectionResponse,
    CollectionUpdate,
    FolderCreate,
    FolderResponse,
)
from app.schemas.request import RequestResponse

router = APIRouter()


async def _get_owned_collection(collection_id: int, user_id: int, db: AsyncSession) -> Collection:
    result = await db.execute(
        select(Collection).where(Collection.id == collection_id, Collection.owner_id == user_id)
    )
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return collection


@router.get("", response_model=list[CollectionResponse])
async def list_collections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Collection]:
    result = await db.execute(
        select(Collection).where(Collection.owner_id == current_user.id).order_by(Collection.updated_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    payload: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Collection:
    collection = Collection(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id,
    )
    db.add(collection)
    await db.flush()
    await db.refresh(collection)
    return collection


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Collection:
    return await _get_owned_collection(collection_id, current_user.id, db)


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: int,
    payload: CollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Collection:
    collection = await _get_owned_collection(collection_id, current_user.id, db)
    if payload.name is not None:
        collection.name = payload.name
    if payload.description is not None:
        collection.description = payload.description
    await db.flush()
    await db.refresh(collection)
    return collection


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    collection = await _get_owned_collection(collection_id, current_user.id, db)
    await db.delete(collection)


@router.post("/{collection_id}/folders", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    collection_id: int,
    payload: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Folder:
    await _get_owned_collection(collection_id, current_user.id, db)

    if payload.parent_id:
        parent_result = await db.execute(
            select(Folder).where(Folder.id == payload.parent_id, Folder.collection_id == collection_id)
        )
        if not parent_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent folder not found")

    folder = Folder(
        name=payload.name,
        collection_id=collection_id,
        parent_id=payload.parent_id,
        sort_order=payload.sort_order,
    )
    db.add(folder)
    await db.flush()
    await db.refresh(folder)
    return folder


@router.get("/{collection_id}/tree")
async def get_collection_tree(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    await _get_owned_collection(collection_id, current_user.id, db)

    folders_result = await db.execute(
        select(Folder).where(Folder.collection_id == collection_id).order_by(Folder.sort_order)
    )
    folders = folders_result.scalars().all()

    requests_result = await db.execute(
        select(ApiRequest)
        .where(ApiRequest.collection_id == collection_id)
        .options(selectinload(ApiRequest.assertions))
        .order_by(ApiRequest.sort_order)
    )
    requests = requests_result.scalars().all()

    return {
        "collection_id": collection_id,
        "folders": [
            {
                "id": f.id,
                "name": f.name,
                "parent_id": f.parent_id,
                "sort_order": f.sort_order,
            }
            for f in folders
        ],
        "requests": [RequestResponse.model_validate(r).model_dump() for r in requests],
    }
