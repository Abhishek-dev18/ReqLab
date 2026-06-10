from datetime import datetime

from pydantic import BaseModel, Field


class EnvironmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    variables: dict[str, str] = Field(default_factory=dict)
    is_global: bool = False
    collection_id: int | None = None


class EnvironmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    variables: dict[str, str] | None = None
    is_global: bool | None = None
    collection_id: int | None = None


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    variables: dict[str, str]
    is_global: bool
    owner_id: int
    collection_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
