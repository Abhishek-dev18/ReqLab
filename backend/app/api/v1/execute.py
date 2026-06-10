from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.environment import Environment
from app.models.history import History
from app.models.user import User
from app.schemas.request import ExecuteRequestPayload, ExecuteResponse
from app.services.assertion_engine import evaluate_assertions
from app.services.request_executor import ExecutionRequest, get_request_executor
from app.services.variable_substitution import apply_variables_to_request

router = APIRouter()


async def _resolve_variables(
    user_id: int,
    environment_id: int | None,
    collection_id: int | None,
    db: AsyncSession,
) -> dict[str, str]:
    variables: dict[str, str] = {}

    global_env = await db.execute(
        select(Environment).where(Environment.owner_id == user_id, Environment.is_global.is_(True))
    )
    for env in global_env.scalars().all():
        variables.update({k: str(v) for k, v in env.variables.items()})

    if collection_id:
        coll_env = await db.execute(
            select(Environment).where(
                Environment.owner_id == user_id,
                Environment.collection_id == collection_id,
                Environment.is_global.is_(False),
            )
        )
        for env in coll_env.scalars().all():
            variables.update({k: str(v) for k, v in env.variables.items()})

    if environment_id:
        specific = await db.execute(
            select(Environment).where(Environment.id == environment_id, Environment.owner_id == user_id)
        )
        env = specific.scalar_one_or_none()
        if env:
            variables.update({k: str(v) for k, v in env.variables.items()})

    return variables


@router.post("", response_model=ExecuteResponse)
async def execute_request(
    payload: ExecuteRequestPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExecuteResponse:
    variables = await _resolve_variables(
        current_user.id, payload.environment_id, payload.collection_id, db
    )

    url, headers, query_params, body, auth_config = apply_variables_to_request(
        payload.url,
        payload.headers,
        payload.query_params,
        payload.body,
        payload.auth_config,
        variables,
    )

    executor = get_request_executor("server")
    execution = ExecutionRequest(
        method=payload.method.upper(),
        url=url,
        headers=headers,
        query_params=query_params,
        body_type=payload.body_type,
        body=body,
        auth_type=payload.auth_type,
        auth_config=auth_config,
    )

    result = await executor.execute(execution)

    assertion_results = evaluate_assertions(
        payload.assertions,
        result.status_code,
        result.response_time_ms,
        result.body,
        result.error,
    )

    history_id = None
    if payload.save_history:
        history_entry = History(
            user_id=current_user.id,
            request_id=payload.request_id,
            collection_id=payload.collection_id,
            method=payload.method.upper(),
            url=url,
            status_code=result.status_code if not result.error else None,
            response_time_ms=result.response_time_ms,
            request_snapshot=payload.model_dump(),
            response_snapshot={
                "status_code": result.status_code,
                "headers": result.headers,
                "body": result.body,
                "content_type": result.content_type,
                "error": result.error,
            },
            assertion_results=[a.model_dump() for a in assertion_results],
        )
        db.add(history_entry)
        await db.flush()
        history_id = history_entry.id

    return ExecuteResponse(
        status_code=result.status_code,
        response_time_ms=result.response_time_ms,
        headers=result.headers,
        body=result.body if not result.error else result.error,
        content_type=result.content_type,
        assertion_results=assertion_results,
        history_id=history_id,
    )
