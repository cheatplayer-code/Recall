"""SearchSession model (search analytics/history)."""

from __future__ import annotations

import uuid

from sqlalchemy import JSON, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class SearchSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "search_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    query: Mapped[str] = mapped_column(String(2048), nullable=False)
    filters: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    result_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
