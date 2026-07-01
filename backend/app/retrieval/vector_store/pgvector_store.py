"""pgvector-backed VectorStore.

Design choice: vectors live in a dedicated ``chunk_vectors`` table (NOT a column
on the relational ``embeddings`` table), keyed by the chunk id. This keeps the
relational schema free of vector columns — the vector backend can change without
a relational migration — while ``Embedding`` rows continue to hold only vector
*metadata*.

Schema (created lazily by ``create_collection``):

    chunk_vectors(
        id        uuid primary key,   -- == chunk id
        vector    vector(<dim>),
        metadata  jsonb not null default '{}'
    )
    + HNSW index on vector (cosine), GIN index on metadata.

pgvector and asyncpg are imported lazily so the module imports without them.
"""

from __future__ import annotations

from typing import Any

import structlog
from sqlalchemy import Float, MetaData, String, Table, cast, delete, func, select, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, insert as pg_insert

from app.database.session import get_engine
from app.retrieval.metadata import OPERATORS
from app.retrieval.vector_store.base import SearchHit, VectorRecord, VectorStore

logger = structlog.get_logger(__name__)


class PgVectorStore(VectorStore):
    def __init__(self, dimension: int) -> None:
        self._dimension = dimension
        self._metadata = MetaData()
        self._table: Table | None = None

    # -- table definition -------------------------------------------------
    def _build_table(self) -> Table:
        if self._table is not None:
            return self._table
        try:
            from pgvector.sqlalchemy import Vector  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - exercised only without extra
            raise RuntimeError(
                "PgVectorStore requires the 'pgvector' extra "
                "(pip install 'recall-backend[pgvector]')."
            ) from exc
        from sqlalchemy import Column, Uuid  # noqa: PLC0415

        self._table = Table(
            "chunk_vectors",
            self._metadata,
            Column("id", Uuid, primary_key=True),
            Column("vector", Vector(self._dimension)),
            Column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb")),
        )
        return self._table

    @property
    def _vectors(self) -> Table:
        return self._build_table()

    # -- lifecycle --------------------------------------------------------
    async def create_collection(self, dimension: int) -> None:
        if dimension != self._dimension:
            logger.warning(
                "pgvector.dimension_override", configured=self._dimension, requested=dimension
            )
        table = self._build_table()
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.run_sync(self._metadata.create_all)
            await conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS chunk_vectors_hnsw "
                    f"ON {table.name} USING hnsw (vector vector_cosine_ops)"
                )
            )
            await conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS chunk_vectors_meta "
                    f"ON {table.name} USING gin (metadata)"
                )
            )
        logger.info("pgvector.create_collection", dimension=self._dimension)

    async def upsert_embeddings(self, records: list[VectorRecord]) -> None:
        if not records:
            return
        table = self._vectors
        rows = [
            {"id": rec.id, "vector": rec.vector, "metadata": rec.metadata}
            for rec in records
        ]
        stmt = pg_insert(table).values(rows)
        stmt = stmt.on_conflict_do_update(
            index_elements=[table.c.id],
            set_={"vector": stmt.excluded.vector, "metadata": stmt.excluded.metadata},
        )
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(stmt)

    async def delete_embeddings(self, flt: dict[str, Any]) -> int:
        table = self._vectors
        stmt = delete(table)
        for clause in self._filter_clauses(flt):
            stmt = stmt.where(clause)
        engine = get_engine()
        async with engine.begin() as conn:
            result = await conn.execute(stmt)
        return result.rowcount or 0

    async def search(
        self,
        query_vector: list[float],
        top_k: int,
        flt: dict[str, Any] | None = None,
    ) -> list[SearchHit]:
        table = self._vectors
        distance = table.c.vector.cosine_distance(query_vector)
        stmt = select(
            cast(table.c.id, String).label("id"),
            distance.label("distance"),
            table.c.metadata.label("metadata"),
        )
        for clause in self._filter_clauses(flt or {}):
            stmt = stmt.where(clause)
        stmt = stmt.order_by(distance.asc()).limit(top_k)

        engine = get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(stmt)
            rows = result.mappings().all()
        return [
            SearchHit(
                id=str(row["id"]),
                score=1.0 - float(row["distance"]),
                metadata=dict(row["metadata"] or {}),
            )
            for row in rows
        ]

    async def health(self) -> bool:
        try:
            engine = get_engine()
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return True
        except Exception:  # pragma: no cover - reachability probe
            logger.warning("pgvector.health_failed", exc_info=True)
            return False

    # -- filter DSL -> SQLAlchemy ----------------------------------------
    def _filter_clauses(self, flt: dict[str, Any]) -> list[Any]:
        table = self._vectors
        meta = table.c.metadata
        clauses: list[Any] = []
        for field, condition in flt.items():
            json_text = meta[field].astext
            if isinstance(condition, dict) and any(op in condition for op in OPERATORS):
                clauses.extend(self._operator_clauses(meta, json_text, field, condition))
            else:
                clauses.append(json_text == str(condition))
        return clauses

    @staticmethod
    def _operator_clauses(
        meta: Any, json_text: Any, field: str, condition: dict[str, Any]
    ) -> list[Any]:
        clauses: list[Any] = []
        for op, operand in condition.items():
            if op == "$eq":
                clauses.append(json_text == str(operand))
            elif op == "$in":
                clauses.append(json_text.in_([str(v) for v in operand]))
            elif op == "$gte":
                clauses.append(cast(json_text, Float) >= operand)
            elif op == "$lte":
                clauses.append(cast(json_text, Float) <= operand)
            elif op == "$contains":
                # JSONB array/object containment: metadata->field @> [operand]
                clauses.append(meta[field].contains([operand]))
            elif op == "$overlap":
                # jsonb ?| text[]: any of the listed elements present in the array.
                clauses.append(
                    meta[field].op("?|")(cast([str(v) for v in operand], ARRAY(String)))
                )
            else:  # pragma: no cover - guarded by OPERATORS
                raise ValueError(f"Unknown filter operator: {op!r}")
        return clauses
