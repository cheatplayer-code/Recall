"""MemoryVectorStore (always) + PgVectorStore (skipped without pgvector/DB)."""

from __future__ import annotations

import importlib

import pytest

from app.retrieval.vector_store.base import VectorRecord
from app.retrieval.vector_store.memory_vector_store import MemoryVectorStore


def _unit(values: list[float]) -> list[float]:
    norm = sum(v * v for v in values) ** 0.5 or 1.0
    return [v / norm for v in values]


async def test_upsert_and_search_top1() -> None:
    store = MemoryVectorStore()
    await store.create_collection(3)
    # 10 vectors along a sweep; the query matches index 7 exactly.
    records = []
    for i in range(10):
        vec = _unit([float(i), float(10 - i), 1.0])
        records.append(
            VectorRecord(id=f"c{i}", vector=vec, metadata={"user_id": "u1", "idx": i})
        )
    await store.upsert_embeddings(records)

    query = _unit([7.0, 3.0, 1.0])
    hits = await store.search(query, top_k=3, flt={"user_id": "u1"})
    assert hits[0].id == "c7"
    assert hits[0].score >= hits[1].score >= hits[2].score


async def test_user_scoping_filter() -> None:
    store = MemoryVectorStore()
    await store.create_collection(2)
    await store.upsert_embeddings(
        [
            VectorRecord("a", _unit([1.0, 0.0]), {"user_id": "u1"}),
            VectorRecord("b", _unit([1.0, 0.0]), {"user_id": "u2"}),
        ]
    )
    hits = await store.search(_unit([1.0, 0.0]), top_k=10, flt={"user_id": "u1"})
    assert [h.id for h in hits] == ["a"]


async def test_filter_dsl_operators() -> None:
    store = MemoryVectorStore()
    await store.create_collection(2)
    await store.upsert_embeddings(
        [
            VectorRecord("x", _unit([1.0, 0.0]), {"user_id": "u", "page": 2, "tags": ["ml"]}),
            VectorRecord("y", _unit([1.0, 0.0]), {"user_id": "u", "page": 9, "tags": ["bio"]}),
        ]
    )
    q = _unit([1.0, 0.0])
    assert {h.id for h in await store.search(q, 10, {"user_id": "u", "page": {"$gte": 5}})} == {"y"}
    assert {h.id for h in await store.search(q, 10, {"user_id": "u", "page": {"$lte": 5}})} == {"x"}
    assert {h.id for h in await store.search(q, 10, {"user_id": "u", "tags": {"$overlap": ["ml"]}})} == {"x"}
    assert {h.id for h in await store.search(q, 10, {"user_id": "u", "tags": {"$contains": "bio"}})} == {"y"}
    assert {h.id for h in await store.search(q, 10, {"user_id": "u", "page": {"$in": [2, 3]}})} == {"x"}


async def test_delete_by_filter() -> None:
    store = MemoryVectorStore()
    await store.create_collection(2)
    await store.upsert_embeddings(
        [
            VectorRecord("a", _unit([1.0, 0.0]), {"user_id": "u", "knowledge_item_id": "k1"}),
            VectorRecord("b", _unit([1.0, 0.0]), {"user_id": "u", "knowledge_item_id": "k2"}),
        ]
    )
    removed = await store.delete_embeddings({"knowledge_item_id": "k1"})
    assert removed == 1
    hits = await store.search(_unit([1.0, 0.0]), 10, {"user_id": "u"})
    assert {h.id for h in hits} == {"b"}


@pytest.mark.skipif(
    importlib.util.find_spec("pgvector") is None,
    reason="pgvector not installed; PgVectorStore requires a Postgres test DB",
)
def test_pgvector_importable() -> None:
    # When the extra is present the module must import and construct cleanly.
    from app.retrieval.vector_store.pgvector_store import PgVectorStore

    store = PgVectorStore(dimension=8)
    assert store is not None
