from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    owner = relationship("User", back_populates="collections")
    folders = relationship(
        "Folder", back_populates="collection", cascade="all, delete-orphan", order_by="Folder.sort_order"
    )
    requests = relationship(
        "Request",
        back_populates="collection",
        cascade="all, delete-orphan",
        foreign_keys="Request.collection_id",
    )
    environments = relationship("Environment", back_populates="collection", cascade="all, delete-orphan")
    history = relationship("History", back_populates="collection")
    openapi_imports = relationship("OpenApiImport", back_populates="collection")
