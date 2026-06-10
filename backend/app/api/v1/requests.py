from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.collections import _get_owned_collection
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.assertion import Assertion
from app.models.request import Request as ApiRequest
from app.models.user import User
from app.schemas.request import RequestCreate, RequestResponse, RequestUpdate

router = APIRouter()


async def _get_request(request_id: int, user_id: int, db: AsyncSession) -> ApiRequest:
    result = await db.execute(
        select(ApiRequest)
        .join(ApiRequest.collection)
        .where(ApiRequest.id == request_id, ApiRequest.collection.has(owner_id=user_id))
        .options(selectinload(ApiRequest.assertions))
    )
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return request


def _sync_assertions(request: ApiRequest, assertions_data: list) -> None:
    request.assertions.clear()
    for item in assertions_data:
        request.assertions.append(
            Assertion(
                assertion_type=item.assertion_type,
                target=item.target,
                expected_value=item.expected_value,
            )
        )


@router.post(
    "/collections/{collection_id}/requests",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_request(
    collection_id: int,
    payload: RequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiRequest:
    await _get_owned_collection(collection_id, current_user.id, db)

    request = ApiRequest(
        name=payload.name,
        method=payload.method.upper(),
        url=payload.url,
        headers=payload.headers,
        query_params=payload.query_params,
        body_type=payload.body_type,
        body=payload.body,
        auth_type=payload.auth_type,
        auth_config=payload.auth_config,
        collection_id=collection_id,
        folder_id=payload.folder_id,
        sort_order=payload.sort_order,
    )
    _sync_assertions(request, payload.assertions)
    db.add(request)
    await db.flush()
    await db.refresh(request, attribute_names=["assertions"])
    return request


@router.get("/{request_id}", response_model=RequestResponse)
async def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiRequest:
    return await _get_request(request_id, current_user.id, db)


@router.put("/{request_id}", response_model=RequestResponse)
async def update_request(
    request_id: int,
    payload: RequestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiRequest:
    request = await _get_request(request_id, current_user.id, db)
    update_data = payload.model_dump(exclude_unset=True, exclude={"assertions"})
    for field, value in update_data.items():
        if field == "method" and value:
            value = value.upper()
        setattr(request, field, value)
    if payload.assertions is not None:
        _sync_assertions(request, payload.assertions)
    await db.flush()
    await db.refresh(request, attribute_names=["assertions"])
    return request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    request = await _get_request(request_id, current_user.id, db)
    await db.delete(request)
