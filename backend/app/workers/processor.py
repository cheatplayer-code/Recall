"""DocumentProcessor — the per-stage transformation seam.

Each stage receives a ``ProcessingContext`` and returns a dict of KnowledgeItem
column updates the worker applies. A stage may also write chunks (via the chunk
repository), vectors (via ``ctx.vector_store``), and embedding metadata (via the
embedding repository) — and nothing else. The worker owns status/progress/retry.

Phase 3 implements real, modality-specific extraction (PyMuPDF / PaddleOCR /
Whisper / Florence-2) and structure-aware chunking, with real embeddings via the
configured ``EmbeddingProvider``. Each backend is selected by config and lazily
loaded; when a backend is disabled or unavailable the stage falls back to a
deterministic placeholder so tests/CI run without the ML libraries. The worker,
its retry/backoff, and this stage contract are untouched.
"""

from __future__ import annotations

import asyncio
import hashlib
from dataclasses import dataclass, field
from typing import Any

import structlog

from app.core.config.settings import Settings
from app.models.enums import EmbeddingStatus, KnowledgeType
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.models.knowledge import KnowledgeItem
from app.models.workspace import Collection
from app.repositories.retrieval import EmbeddingRepository, KnowledgeChunkRepository
from app.retrieval.embedder import EmbeddingProvider
from app.retrieval.enrichment import EnrichmentInput, get_enricher
from app.retrieval.metadata import build_chunk_metadata
from app.retrieval.vector_store.base import VectorRecord, VectorStore
from app.storage.service import StorageService, get_storage_service
from app.workers import extractors

logger = structlog.get_logger(__name__)


@dataclass(slots=True)
class ProcessingContext:
    """Everything a stage needs. Stages mutate via repositories, not the worker."""

    job: DocumentProcessingJob
    item: KnowledgeItem
    upload: UploadJob | None
    session: Any  # AsyncSession (untyped to avoid a hard import cycle in workers)
    embedder: EmbeddingProvider
    vector_store: VectorStore
    settings: Settings
    collection: Collection | None = None
    storage: StorageService | None = None
    # Transient per-job artifacts passed between stages within one worker run
    # (e.g. extract → chunk hands over pages/sections/segments). Never persisted.
    artifacts: dict[str, Any] = field(default_factory=dict)

    def get_storage(self) -> StorageService:
        if self.storage is None:
            self.storage = get_storage_service()
        return self.storage


class DocumentProcessor:
    """Stage transformations. Stateless; safe to share across jobs."""

    async def prepare(self, ctx: ProcessingContext) -> dict[str, Any]:
        """Confirm the source is available; surface basic facets."""
        size = ctx.upload.size_bytes if ctx.upload else 0
        logger.info(
            "processor.prepare",
            knowledge_item_id=str(ctx.item.id),
            type=ctx.item.type,
            size_bytes=size,
        )
        return {}

    async def extract(self, ctx: ProcessingContext) -> dict[str, Any]:
        """Produce ``content`` (+ facets) per modality, using real ML when enabled.

        Dispatches by ``ctx.item.type`` for the raw text, then derives the AI
        enrichment facet (summary, mood, topics, …) from that text. Each modality
        branch uses the configured backend if available and falls back to a
        deterministic placeholder otherwise. Runtime model failures propagate so
        the worker's retry/backoff applies; a merely-missing/disabled backend is
        not an error (it degrades gracefully). Enrichment never raises — it only
        adds facets — so it can't fail the pipeline on its own.
        """
        updates = await self._extract_content(ctx)
        ai = self._enrich(ctx, str(updates.get("content") or ""))
        if ai is not None:
            updates["ai"] = ai
        return updates

    async def _extract_content(self, ctx: ProcessingContext) -> dict[str, Any]:
        item_type = _safe_type(ctx.item.type)
        raw = await self._read_source(ctx)

        if item_type == KnowledgeType.PDF:
            return await self._extract_pdf(ctx, raw)
        if item_type == KnowledgeType.PHOTO:
            return await self._extract_image(ctx, raw)
        if item_type in {KnowledgeType.VOICE, KnowledgeType.VIDEO}:
            return await self._extract_audio(ctx, raw)
        return await self._extract_text(ctx, raw)

    def _enrich(self, ctx: ProcessingContext, content: str) -> dict[str, Any] | None:
        """Derive the AI facet for the item's content, degrading to None on error.

        The AI facet is best-effort adornment; a failure here must never fail an
        otherwise-good ingestion, so any error is logged and swallowed.
        """
        try:
            enricher = get_enricher(ctx.settings)
            facet = enricher.enrich(
                EnrichmentInput(
                    content=content,
                    title=ctx.item.title,
                    item_type=str(ctx.item.type),
                )
            )
        except Exception:  # noqa: BLE001 - enrichment is non-critical
            logger.warning(
                "processor.enrich_failed",
                knowledge_item_id=str(ctx.item.id),
                exc_info=True,
            )
            return None
        return facet.as_facet() if facet is not None else None

    # -- per-modality extraction -----------------------------------------
    async def _extract_text(self, ctx: ProcessingContext, raw: bytes | None) -> dict[str, Any]:
        item = ctx.item
        item_type = _safe_type(item.type)
        content = item.content or ""
        if not content and raw is not None:
            content = raw.decode("utf-8", errors="replace")
        if not content and item_type in {
            KnowledgeType.LINK,
            KnowledgeType.WEBSITE,
            KnowledgeType.BOOKMARK,
        }:
            content = item.source_url or item.title
        content = content or item.title
        return {"content": content, "excerpt": _excerpt(content)}

    async def _extract_pdf(self, ctx: ProcessingContext, raw: bytes | None) -> dict[str, Any]:
        use_real = ctx.settings.pdf_backend == "pymupdf" and extractors.pdf.is_available()
        if raw is None or not use_real:
            if raw is None and ctx.settings.pdf_backend == "pymupdf":
                logger.warning("processor.pdf_no_bytes", knowledge_item_id=str(ctx.item.id))
            return self._placeholder(ctx, "PDF")

        ocr_page = self._ocr_callable(ctx)
        result = await asyncio.to_thread(extractors.pdf.extract_pdf, raw, ocr_page=ocr_page)
        ctx.artifacts["pages"] = result.pages
        ctx.artifacts["sections"] = result.sections
        logger.info(
            "processor.pdf_extracted",
            knowledge_item_id=str(ctx.item.id),
            pages=result.page_count,
            sections=len(result.sections),
        )
        return {
            "content": result.text,
            "excerpt": _excerpt(result.text, 500),
            "page_count": result.page_count,
        }

    async def _extract_image(self, ctx: ProcessingContext, raw: bytes | None) -> dict[str, Any]:
        if raw is None:
            return self._placeholder(ctx, "Image")

        parts: list[str] = []
        # OCR first (text-heavy images), then a caption for everything else.
        if ctx.settings.ocr_backend == "paddle" and extractors.ocr.is_available():
            ocr_text = await asyncio.to_thread(
                extractors.ocr.ocr_image, raw, ctx.settings.ocr_lang
            )
            if ocr_text:
                parts.append(ocr_text)

        caption = ""
        if ctx.settings.captioning_backend == "florence2" and extractors.captioning.is_available():
            caption = await asyncio.to_thread(
                extractors.captioning.caption_image, raw, ctx.settings.captioning_model
            )
            if caption:
                parts.insert(0, caption)

        if not parts:
            return self._placeholder(ctx, "Image")
        content = "\n\n".join(parts)
        logger.info("processor.image_extracted", knowledge_item_id=str(ctx.item.id))
        return {"content": content, "excerpt": _excerpt(caption or content)}

    async def _extract_audio(self, ctx: ProcessingContext, raw: bytes | None) -> dict[str, Any]:
        use_real = (
            ctx.settings.transcription_backend == "whisper"
            and extractors.transcription.is_available()
        )
        if raw is None or not use_real:
            return self._placeholder(ctx, "Transcript")

        suffix = self._source_suffix(ctx)
        result = await asyncio.to_thread(
            extractors.transcription.transcribe,
            raw,
            ctx.settings.transcription_model,
            suffix=suffix,
        )
        ctx.artifacts["segments"] = result.segments
        logger.info(
            "processor.audio_transcribed",
            knowledge_item_id=str(ctx.item.id),
            language=result.language,
            segments=len(result.segments),
        )
        return {"content": result.text, "excerpt": _excerpt(result.text)}

    # -- extraction helpers ----------------------------------------------
    async def _read_source(self, ctx: ProcessingContext) -> bytes | None:
        if ctx.upload is not None and ctx.upload.storage_key:
            return await ctx.get_storage().read(ctx.upload.storage_key)
        return None

    def _ocr_callable(self, ctx: ProcessingContext):  # noqa: ANN202 - Callable|None
        if ctx.settings.ocr_backend == "paddle" and extractors.ocr.is_available():
            lang = ctx.settings.ocr_lang
            return lambda png: extractors.ocr.ocr_image(png, lang)
        return None

    def _source_suffix(self, ctx: ProcessingContext) -> str:
        name = (ctx.upload.filename if ctx.upload else None) or ctx.item.title
        dot = name.rfind(".")
        return name[dot:] if 0 <= dot < len(name) - 1 else ".bin"

    def _placeholder(self, ctx: ProcessingContext, label: str) -> dict[str, Any]:
        content = ctx.item.content or f"[{label} placeholder] {ctx.item.title}"
        updates: dict[str, Any] = {"content": content, "excerpt": _excerpt(content)}
        if label == "PDF":
            updates["page_count"] = max(1, len(content) // 1500 + 1)
        return updates

    async def chunk(self, ctx: ProcessingContext) -> dict[str, Any]:
        """Split content into chunks, respecting structure when available.

        PDF pages/sections (from ``extract``) become page- and section-tagged
        chunks; audio segments carry ``start_ms``/``end_ms`` in ``meta``; anything
        else falls back to char-based splitting with overlap.
        """
        size = ctx.settings.chunk_char_size
        overlap = ctx.settings.chunk_overlap

        if ctx.artifacts.get("pages"):
            specs = _chunk_pages(ctx.artifacts["pages"], ctx.artifacts.get("sections", []), size, overlap)
        elif ctx.artifacts.get("segments"):
            specs = _chunk_segments(ctx.artifacts["segments"], size)
        else:
            text = (ctx.item.content or "").strip()
            specs = [
                _ChunkSpec(text=piece) for piece in _split_text(text, size, overlap)
            ]

        chunk_repo = KnowledgeChunkRepository(ctx.session)
        rows = [
            {
                "knowledge_item_id": ctx.item.id,
                "chunk_index": index,
                "text": spec.text,
                "token_count": _estimate_tokens(spec.text),
                "page_number": spec.page_number,
                "section_title": spec.section_title,
                "embedding_status": EmbeddingStatus.PENDING.value,
                "meta": spec.meta,
            }
            for index, spec in enumerate(specs)
            if spec.text.strip()
        ]
        if rows:
            await chunk_repo.bulk_create(rows)
        return {
            "chunk_count": len(rows),
            "embedding_status": EmbeddingStatus.EMBEDDING.value,
        }

    async def embed(self, ctx: ProcessingContext) -> dict[str, Any]:
        """Embed chunk texts and upsert their vectors into the vector store."""
        chunk_repo = KnowledgeChunkRepository(ctx.session)
        chunks = await chunk_repo.list_by_knowledge_item(ctx.item.id)
        if not chunks:
            return {"embedding_status": EmbeddingStatus.READY.value}

        texts = [chunk.text for chunk in chunks]
        vectors = ctx.embedder.embed_texts(texts)
        await ctx.vector_store.create_collection(ctx.embedder.dimension)

        records = [
            VectorRecord(
                id=str(chunk.id),
                vector=vector,
                metadata=build_chunk_metadata(ctx.item, chunk, ctx.embedder, ctx.collection),
            )
            for chunk, vector in zip(chunks, vectors, strict=True)
        ]
        await ctx.vector_store.upsert_embeddings(records)
        await chunk_repo.mark_embedded([chunk.id for chunk in chunks])
        return {"embedding_status": EmbeddingStatus.READY.value}

    async def index(self, ctx: ProcessingContext) -> dict[str, Any]:
        """Persist Embedding metadata rows (provider/model/version/dim/checksum)."""
        chunk_repo = KnowledgeChunkRepository(ctx.session)
        embedding_repo = EmbeddingRepository(ctx.session)
        chunks = await chunk_repo.list_by_knowledge_item(ctx.item.id)
        rows = [
            {
                "chunk_id": chunk.id,
                "provider": ctx.embedder.provider,
                "model": ctx.embedder.model,
                "model_version": ctx.embedder.version,
                "dimension": ctx.embedder.dimension,
                "checksum": hashlib.sha256(chunk.text.encode()).hexdigest(),
                "status": EmbeddingStatus.READY.value,
            }
            for chunk in chunks
        ]
        if rows:
            await embedding_repo.bulk_create(rows)
        return {"embedding_status": EmbeddingStatus.READY.value}


# --- chunk specs & structure-aware chunking ------------------------------
@dataclass(slots=True)
class _ChunkSpec:
    text: str
    page_number: int | None = None
    section_title: str | None = None
    meta: dict[str, Any] = field(default_factory=dict)


def _section_for_page(sections: list[dict[str, Any]], page_number: int) -> str | None:
    """Most recent TOC section whose start page is <= ``page_number``."""
    title: str | None = None
    best = -1
    for section in sections:
        start = int(section.get("page", 0) or 0)
        if start <= page_number and start >= best:
            best = start
            title = section.get("title")
    return title


def _chunk_pages(
    pages: list[str], sections: list[dict[str, Any]], size: int, overlap: int
) -> list[_ChunkSpec]:
    specs: list[_ChunkSpec] = []
    for page_index, page_text in enumerate(pages):
        page_number = page_index + 1
        section_title = _section_for_page(sections, page_number)
        for piece in _split_text(page_text.strip(), size, overlap):
            specs.append(
                _ChunkSpec(
                    text=piece,
                    page_number=page_number,
                    section_title=section_title,
                    meta={"modality": "pdf"},
                )
            )
    return specs


def _chunk_segments(segments: list[dict[str, Any]], size: int) -> list[_ChunkSpec]:
    """Group transcript segments into chunks up to ``size`` chars, keeping timing."""
    specs: list[_ChunkSpec] = []
    buffer: list[str] = []
    start_ms: int | None = None
    end_ms: int | None = None

    def flush() -> None:
        nonlocal buffer, start_ms, end_ms
        if buffer:
            specs.append(
                _ChunkSpec(
                    text=" ".join(buffer).strip(),
                    meta={"modality": "audio", "start_ms": start_ms, "end_ms": end_ms},
                )
            )
        buffer, start_ms, end_ms = [], None, None

    for segment in segments:
        text = str(segment.get("text", "")).strip()
        if not text:
            continue
        if start_ms is None:
            start_ms = segment.get("start_ms")
        end_ms = segment.get("end_ms")
        buffer.append(text)
        if sum(len(t) for t in buffer) >= size:
            flush()
    flush()
    return specs


# --- helpers -------------------------------------------------------------
def _safe_type(value: str) -> KnowledgeType:
    try:
        return KnowledgeType(value)
    except ValueError:
        return KnowledgeType.NOTE


def _excerpt(content: str, length: int = 280) -> str:
    content = content.strip()
    return content[:length]


def _estimate_tokens(text: str) -> int:
    # Rough heuristic (~4 chars/token) until a real tokenizer is wired in.
    return max(1, len(text) // 4)


def _split_text(text: str, size: int, overlap: int) -> list[str]:
    if not text:
        return []
    if size <= 0:
        return [text]
    overlap = max(0, min(overlap, size - 1))
    step = size - overlap
    pieces: list[str] = []
    start = 0
    while start < len(text):
        pieces.append(text[start : start + size])
        start += step
    return pieces
