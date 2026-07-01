"""initial schema (all relational tables)

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-30

Design note: the schema is created from the SQLAlchemy models
(``Base.metadata``) rather than hand-written ``op.create_table`` calls. This
guarantees the migrated schema can never drift from the ORM definitions, which
is the source of truth in this codebase. Subsequent migrations (e.g. adding the
``ai`` enrichment column) use explicit ``op`` operations.
"""

from __future__ import annotations

from alembic import op

from app.models import Base

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
