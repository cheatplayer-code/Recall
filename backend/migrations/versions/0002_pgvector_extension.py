"""enable pgvector extension

Revision ID: 0002_pgvector
Revises: 0001_initial
Create Date: 2026-06-30

Enables the ``vector`` extension on Postgres so ``PgVectorStore`` can create the
``chunk_vectors`` table + HNSW index at runtime. No-op on non-Postgres backends
(e.g. SQLite used in tests).
"""

from __future__ import annotations

from alembic import op

revision = "0002_pgvector"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP EXTENSION IF EXISTS vector")
