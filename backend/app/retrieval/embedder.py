"""Embedding seam — the single place text becomes vectors.

Contract (kept stable for the rest of the system):

    embed_texts(list[str]) -> list[list[float]]   # one vector per input
    dimension -> int                              # width of every vector
    provider  -> str                              # e.g. "huggingface"
    model     -> str                              # e.g. "BAAI/bge-m3"
    version   -> str                              # persisted for re-embed detection

Two implementations:

* ``DeterministicEmbedder`` — dependency-free blake2b hashing stand-in. Stable
  across runs, no GPU/network. This is the CI/test fallback and must keep
  working when selected via config.
* ``HuggingFaceEmbedder`` — a real sentence-transformers model (default
  ``BAAI/bge-m3``). The model is **lazy-loaded** on first ``embed_texts`` call
  and cached in a module-level singleton; it is never imported or downloaded at
  module import time.

``get_embedder()`` selects the implementation from settings and caches it.
"""

from __future__ import annotations

import hashlib
import math
import threading
from abc import ABC, abstractmethod
from functools import lru_cache

import structlog

from app.core.config.settings import Settings, get_settings

logger = structlog.get_logger(__name__)


class EmbeddingProvider(ABC):
    """Interface every embedding backend must satisfy."""

    @abstractmethod
    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts into unit-comparable float vectors.

        Returns one vector per input text, in input order. Each vector has
        length ``self.dimension``.
        """

    @property
    @abstractmethod
    def dimension(self) -> int:
        """The fixed width of every produced vector."""

    @property
    @abstractmethod
    def provider(self) -> str:
        """Short provider identifier, persisted on Embedding rows."""

    @property
    @abstractmethod
    def model(self) -> str:
        """Model identifier, persisted on Embedding rows."""

    @property
    @abstractmethod
    def version(self) -> str:
        """Model version tag, persisted on Embedding rows for re-embed detection."""


class DeterministicEmbedder(EmbeddingProvider):
    """A deterministic, dependency-free embedder for dev and tests.

    Each text is hashed with blake2b into ``dimension`` bytes, mapped to the
    range [-1, 1], and L2-normalized. The result is stable across processes and
    produces non-zero, comparable vectors — enough to exercise the full
    chunk → embed → index → search path without any ML dependency.
    """

    def __init__(self, dimension: int = 1024, *, version: str = "v1") -> None:
        if dimension <= 0:
            raise ValueError("dimension must be positive")
        self._dimension = dimension
        self._version = version

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(text) for text in texts]

    def _embed_one(self, text: str) -> list[float]:
        raw = self._hash_to_bytes(text, self._dimension)
        # Map each byte 0..255 -> [-1, 1].
        vec = [(b / 127.5) - 1.0 for b in raw]
        return _l2_normalize(vec)

    @staticmethod
    def _hash_to_bytes(text: str, length: int) -> bytes:
        out = bytearray()
        counter = 0
        data = text.encode("utf-8")
        while len(out) < length:
            h = hashlib.blake2b(data, digest_size=64, salt=counter.to_bytes(8, "little"))
            out.extend(h.digest())
            counter += 1
        return bytes(out[:length])

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def provider(self) -> str:
        return "deterministic"

    @property
    def model(self) -> str:
        return f"blake2b-{self._dimension}"

    @property
    def version(self) -> str:
        return self._version


# Module-level cache of loaded SentenceTransformer models, keyed by model name.
# Guarded by a lock because the worker may embed concurrently.
_st_models: dict[str, object] = {}
_st_lock = threading.Lock()


def _load_sentence_transformer(model_name: str) -> object:
    """Lazily import sentence-transformers and load (once) the named model."""
    cached = _st_models.get(model_name)
    if cached is not None:
        return cached
    with _st_lock:
        cached = _st_models.get(model_name)
        if cached is not None:
            return cached
        try:
            from sentence_transformers import SentenceTransformer  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - exercised only without the extra
            raise RuntimeError(
                "HuggingFaceEmbedder requires the 'embeddings' extra "
                "(pip install 'recall-backend[embeddings]')."
            ) from exc
        logger.info("embedder.load_model", model=model_name)
        model = SentenceTransformer(model_name)
        _st_models[model_name] = model
        return model


class HuggingFaceEmbedder(EmbeddingProvider):
    """Real text embeddings via sentence-transformers (default ``BAAI/bge-m3``).

    The underlying model is loaded lazily and shared across instances/threads.
    Vectors are L2-normalized at the model level (``normalize_embeddings=True``)
    so cosine similarity reduces to a dot product downstream.
    """

    def __init__(
        self,
        model_name: str = "BAAI/bge-m3",
        *,
        provider: str = "huggingface",
        version: str = "v1",
        expected_dimension: int | None = None,
    ) -> None:
        self._model_name = model_name
        self._provider = provider
        self._version = version
        self._expected_dimension = expected_dimension
        self._dimension: int | None = None

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        model = _load_sentence_transformer(self._model_name)
        # encode returns a numpy array; tolist() yields list[list[float]].
        vectors = model.encode(  # type: ignore[attr-defined]
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).tolist()
        self._record_dimension(len(vectors[0]))
        return vectors

    def _record_dimension(self, dim: int) -> None:
        if self._dimension is None:
            if self._expected_dimension is not None and dim != self._expected_dimension:
                logger.warning(
                    "embedder.dimension_mismatch",
                    model=self._model_name,
                    expected=self._expected_dimension,
                    actual=dim,
                )
            self._dimension = dim

    @property
    def dimension(self) -> int:
        if self._dimension is not None:
            return self._dimension
        # Resolve without a forward pass when possible; fall back to the
        # configured expectation so callers can size storage before first use.
        model = _load_sentence_transformer(self._model_name)
        resolved = getattr(model, "get_sentence_embedding_dimension", lambda: None)()
        self._dimension = resolved or self._expected_dimension
        if self._dimension is None:
            raise RuntimeError(
                f"Could not determine embedding dimension for {self._model_name}"
            )
        return self._dimension

    @property
    def provider(self) -> str:
        return self._provider

    @property
    def model(self) -> str:
        return self._model_name

    @property
    def version(self) -> str:
        return self._version


def _l2_normalize(vec: list[float]) -> list[float]:
    norm = math.sqrt(sum(v * v for v in vec))
    if norm == 0.0:
        return vec
    return [v / norm for v in vec]


def _build_embedder(settings: Settings) -> EmbeddingProvider:
    provider = settings.embedding_provider
    if provider == "huggingface":
        return HuggingFaceEmbedder(
            model_name=settings.embedding_model,
            provider=settings.embedding_provider,
            version=settings.model_version,
            expected_dimension=settings.vector_dimension,
        )
    if provider == "deterministic":
        return DeterministicEmbedder(
            dimension=settings.vector_dimension,
            version=settings.model_version,
        )
    raise ValueError(f"Unknown embedding_provider: {provider!r}")


@lru_cache
def get_embedder() -> EmbeddingProvider:
    """Return the process-wide embedder selected by settings."""
    return _build_embedder(get_settings())
