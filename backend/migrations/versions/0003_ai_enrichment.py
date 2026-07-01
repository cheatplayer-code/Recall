"""add ai enrichment column to knowledge_items

Revision ID: 0003_ai_enrichment
Revises: 0002_pgvector
Create Date: 2026-07-01

Adds the nullable ``ai`` JSON column that holds the per-memory AI facet
(summary, mood, topics, key_moments, action_items) produced by the enrichment
seam during processing. Null for rows created before enrichment ran; the
frontend treats null as "not enriched yet".

Idempotent by design: revision ``0001`` builds the baseline via
``Base.metadata.create_all`` (the live models are the source of truth), so on a
fresh database ``ai`` already exists by the time this runs. We only add it when
missing — which is exactly the case for a database migrated before the column
was introduced.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003_ai_enrichment"
down_revision = "0002_pgvector"
branch_labels = None
depends_on = None


def _has_ai_column() -> bool:
    columns = sa.inspect(op.get_bind()).get_columns("knowledge_items")
    return any(col["name"] == "ai" for col in columns)


def upgrade() -> None:
    if not _has_ai_column():
        op.add_column("knowledge_items", sa.Column("ai", sa.JSON(), nullable=True))


def downgrade() -> None:
    if _has_ai_column():
        op.drop_column("knowledge_items", "ai")
