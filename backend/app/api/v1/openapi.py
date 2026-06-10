from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.collection import Collection
from app.models.folder import Folder
from app.models.openapi_import import OpenApiImport
from app.models.request import Request as ApiRequest
from app.models.user import User
from app.schemas.openapi import OpenApiImportRequest, OpenApiImportResponse
from app.services.openapi_parser import extract_endpoints, parse_openapi_spec

router = APIRouter()


@router.post("/import", response_model=OpenApiImportResponse, status_code=status.HTTP_201_CREATED)
async def import_openapi(
    payload: OpenApiImportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OpenApiImportResponse:
    try:
        spec, source_format = parse_openapi_spec(payload.content)
        endpoints = extract_endpoints(spec)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    info = spec.get("info", {})
    collection_name = payload.collection_name or info.get("title", "Imported API")

    collection = Collection(
        name=collection_name,
        description=info.get("description"),
        owner_id=current_user.id,
    )
    db.add(collection)
    await db.flush()

    folder_map: dict[str, int] = {}
    requests_created = 0
    folders_created = 0

    for endpoint in endpoints:
        folder_name = endpoint["folder"]
        if folder_name not in folder_map:
            folder = Folder(name=folder_name, collection_id=collection.id, sort_order=folders_created)
            db.add(folder)
            await db.flush()
            folder_map[folder_name] = folder.id
            folders_created += 1

        request = ApiRequest(
            name=endpoint["name"],
            method=endpoint["method"],
            url=endpoint["url"],
            headers=endpoint["headers"],
            query_params=endpoint["query_params"],
            body_type=endpoint["body_type"],
            body=endpoint["body"],
            collection_id=collection.id,
            folder_id=folder_map[folder_name],
            sort_order=requests_created,
        )
        db.add(request)
        requests_created += 1

    import_record = OpenApiImport(
        user_id=current_user.id,
        collection_id=collection.id,
        title=info.get("title", collection_name),
        version=info.get("version") or spec.get("openapi"),
        source_format=source_format,
        raw_spec=payload.content[:10000],
    )
    db.add(import_record)
    await db.flush()

    return OpenApiImportResponse(
        id=import_record.id,
        collection_id=collection.id,
        title=import_record.title,
        version=import_record.version,
        source_format=import_record.source_format,
        requests_created=requests_created,
        folders_created=folders_created,
        created_at=import_record.created_at,
    )
