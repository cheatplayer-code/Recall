"""Tests for the embedding seam (Step 1).

The deterministic embedder is always exercised. The real HuggingFace embedder
test is skipped gracefully when sentence-transformers (or the model weights)
are unavailable, so CI stays GPU/network-free.
"""

from __future__ import annotations

import importlib

import pytest

from app.core.config.settings import get_settings
from app.retrieval.embedder import (
    DeterministicEmbedder,
    EmbeddingProvider,
    HuggingFaceEmbedder,
    get_embedder,
)


def _approx_unit_norm(vec: list[float]) -> bool:
    norm = sum(v * v for v in vec) ** 0.5
    return abs(norm - 1.0) < 1e-6


class TestDeterministicEmbedder:
    def test_shape(self) -> None:
        emb = DeterministicEmbedder(dimension=256)
        out = emb.embed_texts(["hello", "world"])
        assert len(out) == 2
        assert all(len(v) == 256 for v in out)

    def test_non_zero_and_normalized(self) -> None:
        emb = DeterministicEmbedder(dimension=128)
        (vec,) = emb.embed_texts(["recall is a knowledge OS"])
        assert any(abs(v) > 0 for v in vec)
        assert _approx_unit_norm(vec)

    def test_deterministic_across_instances(self) -> None:
        a = DeterministicEmbedder(dimension=64).embed_texts(["same input"])
        b = DeterministicEmbedder(dimension=64).embed_texts(["same input"])
        assert a == b

    def test_distinct_inputs_differ(self) -> None:
        emb = DeterministicEmbedder(dimension=64)
        out = emb.embed_texts(["alpha", "beta"])
        assert out[0] != out[1]

    def test_empty_batch(self) -> None:
        assert DeterministicEmbedder(dimension=32).embed_texts([]) == []

    def test_metadata(self) -> None:
        emb = DeterministicEmbedder(dimension=32, version="v9")
        assert emb.provider == "deterministic"
        assert emb.model == "blake2b-32"
        assert emb.version == "v9"
        assert emb.dimension == 32


class TestGetEmbedder:
    def test_selects_deterministic_in_tests(self) -> None:
        # conftest forces RECALL_EMBEDDING_PROVIDER=deterministic.
        get_embedder.cache_clear()
        emb = get_embedder()
        assert isinstance(emb, EmbeddingProvider)
        assert emb.provider == "deterministic"
        assert emb.dimension == get_settings().vector_dimension


_HAS_SENTENCE_TRANSFORMERS = importlib.util.find_spec("sentence_transformers") is not None


@pytest.mark.skipif(
    not _HAS_SENTENCE_TRANSFORMERS,
    reason="sentence-transformers not installed (real-embedding test is opt-in)",
)
class TestHuggingFaceEmbedder:
    def test_real_embeddings_shape_and_non_zero(self) -> None:
        # Uses a tiny public model to keep the download small; the production
        # default (BAAI/bge-m3) shares the same interface.
        emb = HuggingFaceEmbedder(model_name="sentence-transformers/all-MiniLM-L6-v2")
        try:
            out = emb.embed_texts(["the quick brown fox", "a lazy dog"])
        except Exception as exc:  # pragma: no cover - network/weights unavailable
            pytest.skip(f"model unavailable: {exc}")
        assert len(out) == 2
        dim = emb.dimension
        assert all(len(v) == dim for v in out)
        assert all(any(abs(x) > 0 for x in v) for v in out)
        assert _approx_unit_norm(out[0])
