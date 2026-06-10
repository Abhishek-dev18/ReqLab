from fastapi import APIRouter

from app.api.v1 import auth, collections, dashboard, environments, execute, folders, history, openapi, requests

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(collections.router, prefix="/collections", tags=["Collections"])
api_router.include_router(folders.router, prefix="/folders", tags=["Folders"])
api_router.include_router(requests.router, prefix="/requests", tags=["Requests"])
api_router.include_router(execute.router, prefix="/execute", tags=["Execute"])
api_router.include_router(environments.router, prefix="/environments", tags=["Environments"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(openapi.router, prefix="/openapi", tags=["OpenAPI"])
