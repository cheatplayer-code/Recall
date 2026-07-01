"""Application configuration — the single config source.

All settings are environment-driven (prefix ``RECALL_``) via pydantic-settings.
No secrets or model identifiers are hardcoded anywhere else in the codebase;
the ML seams (embedder, vector store, processor) read their backend selection
and tuning exclusively from here.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Literal aliases for the seam-selection switches. Keeping these as types means
# a typo in an env value fails fast at startup rather than silently picking a
# deterministic fallback in production.
EmbeddingProviderName = Literal["huggingface", "deterministic"]
VectorStoreBackend = Literal["memory", "pgvector"]
RerankerBackend = Literal["noop", "cross_encoder"]
EnrichmentBackend = Literal["heuristic", "none"]
PdfBackend = Literal["pymupdf", "none"]
OcrBackend = Literal["paddle", "none"]
TranscriptionBackend = Literal["whisper", "none"]
CaptioningBackend = Literal["florence2", "blip2", "none"]


class Settings(BaseSettings):
    """Validated application settings.

    Only the fields needed by the ML pipeline (Phase 1) are defined here; more
    fields (database/redis URLs, JWT secret, upload limits, …) are added by the
    surrounding application as those subsystems are built out.
    """

    model_config = SettingsConfigDict(
        env_prefix="RECALL_",
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    environment: str = "development"

    # --- Infrastructure --------------------------------------------------
    database_url: str = "postgresql+asyncpg://recall:recall@localhost:5432/recall"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "dev-insecure-secret-change-me"
    access_token_ttl_seconds: int = 60 * 15
    refresh_token_ttl_seconds: int = 60 * 60 * 24 * 30

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # File storage
    storage_dir: str = "/data/storage"
    storage_public_url: str | None = "http://localhost:8000/storage"

    # Per-type upload limits (MB)
    max_upload_size_mb: int = 50
    max_upload_size_mb_image: int = 50
    max_upload_size_mb_pdf: int = 100
    max_upload_size_mb_video: int = 500
    max_upload_size_mb_audio: int = 200

    # Worker
    run_worker_in_process: bool = False
    worker_poll_interval_seconds: float = 1.0
    worker_max_retries: int = 3
    worker_backoff_base_seconds: float = 5.0
    log_json: bool = False

    # --- Embeddings seam -------------------------------------------------
    # Production default is the real model; tests/CI override to "deterministic"
    # via env so they run without GPU/network (see tests/conftest.py).
    embedding_provider: EmbeddingProviderName = "huggingface"
    embedding_model: str = "BAAI/bge-m3"
    # The on-the-wire / stored dimension. For deterministic embeddings this is
    # authoritative; for a real model it must match the model's output width and
    # is validated at first use.
    vector_dimension: int = 1024
    # Persisted with every Embedding row to support re-embedding detection when
    # a model is upgraded without a dimension change.
    model_version: str = "v1"

    # --- Vector store seam ----------------------------------------------
    vector_store_backend: VectorStoreBackend = "memory"

    # --- Extraction seams ------------------------------------------------
    # PDF parsing prefers born-digital text via PyMuPDF; OCR is a fallback for
    # scanned pages only when ocr_backend is enabled.
    pdf_backend: PdfBackend = "pymupdf"
    ocr_backend: OcrBackend = "none"
    ocr_lang: str = "en"
    transcription_backend: TranscriptionBackend = "none"
    # large-v3 is most accurate; "turbo" is much faster on CPU. Config-driven.
    transcription_model: str = "large-v3"
    captioning_backend: CaptioningBackend = "none"
    captioning_model: str = "microsoft/Florence-2-base"

    # --- Chunking / retrieval tuning ------------------------------------
    chunk_char_size: int = 2000
    chunk_overlap: int = 200
    retrieval_top_k: int = 10

    # --- AI enrichment seam ---------------------------------------------
    # Derives the per-memory AI facet (summary, mood, topics, key moments,
    # action items) the frontend renders. "heuristic" is dependency-free and the
    # CI default; "none" disables enrichment.
    enrichment_backend: EnrichmentBackend = "heuristic"
    # Cap the content window the heuristics scan (keeps large docs cheap).
    enrichment_max_chars: int = 20000
    enrichment_summary_max_chars: int = 220
    enrichment_max_topics: int = 6
    enrichment_max_key_moments: int = 4
    enrichment_max_action_items: int = 5

    # --- Hybrid search + reranker ---------------------------------------
    hybrid_enabled: bool = True
    rrf_k: int = 60  # standard Reciprocal Rank Fusion constant
    reranker_backend: RerankerBackend = "noop"
    reranker_model: str = "BAAI/bge-reranker-v2"
    rerank_top_k: int = 50  # candidates handed to the reranker
    retrieval_top_k_hybrid: int = 100  # candidate pool from each source before fusion

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors(cls, value: object) -> object:
        """Accept a comma-separated string for CORS origins from env."""
        if isinstance(value, str) and not value.strip().startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide singleton settings instance."""
    return Settings()
