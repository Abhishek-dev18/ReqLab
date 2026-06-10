from datetime import datetime

from pydantic import BaseModel, Field


class OpenApiImportRequest(BaseModel):
    content: str = Field(description="OpenAPI spec as JSON or YAML string")
    collection_name: str | None = Field(default=None, description="Override collection name from spec")


class OpenApiImportResponse(BaseModel):
    id: int
    collection_id: int
    title: str
    version: str | None
    source_format: str
    requests_created: int
    folders_created: int
    created_at: datetime

    model_config = {"from_attributes": True}
