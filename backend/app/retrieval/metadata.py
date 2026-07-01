"""Chunk-metadata construction and the retrieval filter mini-DSL.

The filter DSL is a dict ``{field: condition}`` where ``condition`` is either a
scalar (equality) or an operator dict:

    {"$in": [...]}        membership
    {"$overlap": [...]}   array/array intersection is non-empty
    {"$contains": value}  array/string contains value
    {"$gte": x}           >=
    {"$lte": x}           <=

``build_filter`` always scopes results to a single user.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:  # pragma: no cover - typing only
    from app.models.chunk import KnowledgeChunk
    from app.models.knowledge import KnowledgeItem
    from app.models.workspace import Collection
    from app.retrieval.embedder import EmbeddingProvider

# Recognised operators.
OPERATORS: frozenset[str] = frozenset(
    {"$in", "$overlap", "$contains", "$gte", "$lte", "$eq"}
)


def build_chunk_metadata(
    item: "KnowledgeItem",
    chunk: "KnowledgeChunk",
    embedder: "EmbeddingProvider",
    collection: "Collection | None" = None,
) -> dict[str, Any]:
    """Build the metadata payload stored alongside a chunk vector.

    Includes everything the retrieval filters and citation assembly need so
    search never has to join back to Postgres for the common path.
    """
    metadata: dict[str, Any] = {
        "user_id": str(item.user_id),
        "workspace_id": str(item.workspace_id),
        "collection_id": str(item.collection_id) if item.collection_id else None,
        "knowledge_item_id": str(item.id),
        "chunk_id": str(chunk.id),
        "chunk_index": chunk.chunk_index,
        "type": item.type,
        "title": item.title,
        "tags": list(item.tags or []),
        "page_number": chunk.page_number,
        "section_title": chunk.section_title,
        "provider": embedder.provider,
        "model": embedder.model,
        "model_version": embedder.version,
        # Snippet kept inline so citations don't require a DB round-trip.
        "text": chunk.text,
    }
    # Merge per-chunk meta (e.g. modality, start_ms/end_ms for audio) without
    # clobbering the reserved keys above.
    for key, value in (chunk.meta or {}).items():
        metadata.setdefault(key, value)
    return metadata


def build_filter(
    user_id: uuid.UUID | str, filters: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Build a metadata filter, always scoped to ``user_id``."""
    result: dict[str, Any] = {"user_id": str(user_id)}
    if filters:
        for key, value in filters.items():
            if value is None:
                continue
            result[key] = value
    return result


def matches_filter(metadata: dict[str, Any], flt: dict[str, Any]) -> bool:
    """Evaluate a metadata dict against a filter (used by in-memory backends)."""
    for field, condition in flt.items():
        value = metadata.get(field)
        if isinstance(condition, dict) and any(op in condition for op in OPERATORS):
            if not _match_operators(value, condition):
                return False
        elif value != condition:
            return False
    return True


def _match_operators(value: Any, condition: dict[str, Any]) -> bool:
    for op, operand in condition.items():
        if op == "$eq":
            if value != operand:
                return False
        elif op == "$in":
            if value not in operand:
                return False
        elif op == "$gte":
            if value is None or value < operand:
                return False
        elif op == "$lte":
            if value is None or value > operand:
                return False
        elif op == "$contains":
            if value is None or operand not in value:
                return False
        elif op == "$overlap":
            left = set(value or [])
            if not left & set(operand or []):
                return False
        else:  # pragma: no cover - guarded by OPERATORS
            raise ValueError(f"Unknown filter operator: {op!r}")
    return True
