"""Reranker seam — optional cross-encoder reordering of retrieved passages.

Default is a no-op (preserves fusion order). A real cross-encoder
(``sentence-transformers`` ``CrossEncoder``) is selected by config and lazily
loaded as a module-level singleton, so tests/CI run without GPU/network.
"""

from __future__ import annotations

import asyncio
import threading
from abc import ABC, abstractmethod

import structlog

from app.core.config.settings import Settings

logger = structlog.get_logger(__name__)


class RerankerProvider(ABC):
    @abstractmethod
    async def rerank(
        self, query: str, passages: list[str], top_k: int
    ) -> list[tuple[int, float]]:
        """Return ``(original_index, score)`` pairs sorted by score descending."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Short identifier for logging/metrics."""


class NoopReranker(RerankerProvider):
    """Preserves the input order, assigning a constant score."""

    async def rerank(
        self, query: str, passages: list[str], top_k: int
    ) -> list[tuple[int, float]]:
        return [(i, 1.0) for i in range(min(top_k, len(passages)))]

    @property
    def name(self) -> str:
        return "noop"


# Module-level singleton cache of loaded CrossEncoder models, keyed by name.
_cross_encoders: dict[str, object] = {}
_lock = threading.Lock()


def _get_cross_encoder(model_name: str) -> object:
    """Lazily import sentence-transformers and load (once) the named model."""
    cached = _cross_encoders.get(model_name)
    if cached is not None:
        return cached
    with _lock:
        cached = _cross_encoders.get(model_name)
        if cached is not None:
            return cached
        try:
            from sentence_transformers import CrossEncoder  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - only without the extra
            raise RuntimeError(
                "CrossEncoderReranker requires the 'embeddings' extra "
                "(pip install 'recall-backend[embeddings]')."
            ) from exc
        logger.info("reranker.load_model", model=model_name)
        model = CrossEncoder(model_name)
        _cross_encoders[model_name] = model
        return model


class CrossEncoderReranker(RerankerProvider):
    """Scores (query, passage) pairs with a cross-encoder; reorders by relevance."""

    def __init__(self, model_name: str = "BAAI/bge-reranker-v2") -> None:
        self._model_name = model_name

    async def rerank(
        self, query: str, passages: list[str], top_k: int
    ) -> list[tuple[int, float]]:
        if not passages:
            return []
        scores = await asyncio.to_thread(self._predict, query, passages)
        ranked = sorted(enumerate(scores), key=lambda pair: pair[1], reverse=True)
        return [(index, float(score)) for index, score in ranked[: min(top_k, len(passages))]]

    def _predict(self, query: str, passages: list[str]) -> list[float]:
        model = _get_cross_encoder(self._model_name)
        raw = model.predict([(query, passage) for passage in passages])  # type: ignore[attr-defined]
        return [float(score) for score in raw]

    @property
    def name(self) -> str:
        return f"cross_encoder:{self._model_name}"


# Cached reranker provider per (backend, model) selection.
_rerankers: dict[tuple[str, str], RerankerProvider] = {}


def get_reranker(settings: Settings) -> RerankerProvider:
    """Return the reranker selected by settings (cached as a singleton)."""
    key = (settings.reranker_backend, settings.reranker_model)
    cached = _rerankers.get(key)
    if cached is not None:
        return cached
    if settings.reranker_backend == "cross_encoder":
        provider: RerankerProvider = CrossEncoderReranker(settings.reranker_model)
    else:
        provider = NoopReranker()
    _rerankers[key] = provider
    return provider
