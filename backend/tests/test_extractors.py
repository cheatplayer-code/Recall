"""Step 3: extraction dispatch, structure-aware chunking, and real extractors."""

from __future__ import annotations

import importlib.util

import pytest

from app.core.config.settings import get_settings
from app.models.chunk import KnowledgeChunk
from app.models.jobs import DocumentProcessingJob, UploadJob
from app.repositories.retrieval import KnowledgeChunkRepository
from app.retrieval.embedder import get_embedder
from app.retrieval.metadata import build_chunk_metadata
from app.retrieval.vector_store import get_vector_store
from app.storage.service import get_storage_service
from app.workers import extractors
from app.workers.processor import (
    DocumentProcessor,
    ProcessingContext,
    _chunk_pages,
    _chunk_segments,
    _section_for_page,
)
from app.workers.extractors.pdf import PdfExtraction
from app.workers.extractors.transcription import Transcription
from tests.factories import make_item, make_user, make_workspace
from app.models.enums import KnowledgeType


async def _ctx(session, *, type_: KnowledgeType, data: bytes | None, filename: str, **overrides):
    user = await make_user(session, email=f"{filename}@x.com")
    ws = await make_workspace(session, user)
    item = await make_item(session, user, ws, title=filename, content="", type_=type_)
    upload = None
    if data is not None:
        stored = await get_storage_service().save(filename, "application/octet-stream", data)
        upload = UploadJob(
            user_id=user.id,
            knowledge_item_id=item.id,
            filename=filename,
            size_bytes=stored.size_bytes,
            checksum=stored.checksum,
            storage_key=stored.storage_key,
            status="stored",
        )
        session.add(upload)
        await session.flush()
    job = DocumentProcessingJob(
        upload_job_id=(upload.id if upload else item.id),
        knowledge_item_id=item.id,
        status="queued",
        stage="uploading",
    )
    session.add(job)
    await session.flush()
    await session.commit()
    settings = get_settings().model_copy(update=overrides)
    return ProcessingContext(
        job=job,
        item=item,
        upload=upload,
        session=session,
        embedder=get_embedder(),
        vector_store=get_vector_store(),
        settings=settings,
    )


# --- pure chunking helpers ----------------------------------------------
def test_section_for_page() -> None:
    sections = [{"title": "Intro", "page": 1}, {"title": "Methods", "page": 3}]
    assert _section_for_page(sections, 1) == "Intro"
    assert _section_for_page(sections, 2) == "Intro"
    assert _section_for_page(sections, 4) == "Methods"
    assert _section_for_page([], 1) is None


def test_chunk_pages_tags_page_and_section() -> None:
    pages = ["alpha " * 30, "bravo " * 30]
    sections = [{"title": "One", "page": 1}, {"title": "Two", "page": 2}]
    specs = _chunk_pages(pages, sections, size=50, overlap=10)
    assert any(s.page_number == 1 and s.section_title == "One" for s in specs)
    assert any(s.page_number == 2 and s.section_title == "Two" for s in specs)
    assert all(s.meta.get("modality") == "pdf" for s in specs)


def test_chunk_segments_keeps_timing() -> None:
    segments = [
        {"start_ms": 0, "end_ms": 1000, "text": "hello there"},
        {"start_ms": 1000, "end_ms": 2000, "text": "world again"},
    ]
    specs = _chunk_segments(segments, size=1000)  # all fits in one chunk
    assert len(specs) == 1
    assert specs[0].meta["start_ms"] == 0
    assert specs[0].meta["end_ms"] == 2000
    assert specs[0].meta["modality"] == "audio"


# --- dispatch wiring (real backend simulated via monkeypatch) ------------
async def test_pdf_dispatch_uses_pymupdf(db_session, monkeypatch) -> None:
    def fake_extract(data, *, ocr_page=None):  # noqa: ANN001, ANN202
        return PdfExtraction(
            text="Page one.\n\nPage two.",
            page_count=2,
            pages=["Page one.", "Page two."],
            sections=[{"title": "Start", "page": 1}],
        )

    monkeypatch.setattr(extractors.pdf, "is_available", lambda: True)
    monkeypatch.setattr(extractors.pdf, "extract_pdf", fake_extract)

    ctx = await _ctx(db_session, type_=KnowledgeType.PDF, data=b"%PDF-fake", filename="d.pdf")
    updates = await DocumentProcessor().extract(ctx)
    assert updates["page_count"] == 2
    assert "Page one." in updates["content"]
    assert ctx.artifacts["pages"] == ["Page one.", "Page two."]

    for k, v in updates.items():
        setattr(ctx.item, k, v)
    await DocumentProcessor().chunk(ctx)
    await db_session.commit()
    chunks = await KnowledgeChunkRepository(db_session).list_by_knowledge_item(ctx.item.id)
    assert {c.page_number for c in chunks} == {1, 2}
    assert any(c.section_title == "Start" for c in chunks)


async def test_pdf_placeholder_when_backend_disabled(db_session) -> None:
    ctx = await _ctx(
        db_session, type_=KnowledgeType.PDF, data=b"%PDF", filename="d.pdf", pdf_backend="none"
    )
    updates = await DocumentProcessor().extract(ctx)
    assert "placeholder" in updates["content"].lower()
    assert "pages" not in ctx.artifacts


async def test_image_caption_dispatch(db_session, monkeypatch) -> None:
    monkeypatch.setattr(extractors.captioning, "is_available", lambda: True)
    monkeypatch.setattr(
        extractors.captioning, "caption_image", lambda data, model: "a red bicycle on a wall"
    )
    ctx = await _ctx(
        db_session,
        type_=KnowledgeType.PHOTO,
        data=b"\x89PNG",
        filename="p.png",
        captioning_backend="florence2",
    )
    updates = await DocumentProcessor().extract(ctx)
    assert updates["content"] == "a red bicycle on a wall"


async def test_audio_transcription_dispatch(db_session, monkeypatch) -> None:
    def fake_transcribe(data, model_name, *, suffix=".bin"):  # noqa: ANN001, ANN202
        return Transcription(
            text="meeting notes here",
            language="en",
            segments=[{"start_ms": 0, "end_ms": 1500, "text": "meeting notes here"}],
        )

    monkeypatch.setattr(extractors.transcription, "is_available", lambda: True)
    monkeypatch.setattr(extractors.transcription, "transcribe", fake_transcribe)
    ctx = await _ctx(
        db_session,
        type_=KnowledgeType.VOICE,
        data=b"RIFF",
        filename="a.mp3",
        transcription_backend="whisper",
    )
    updates = await DocumentProcessor().extract(ctx)
    assert updates["content"] == "meeting notes here"
    assert ctx.artifacts["segments"][0]["start_ms"] == 0


async def test_runtime_extractor_error_propagates(db_session, monkeypatch) -> None:
    # A real model failure must raise so the worker's retry/backoff kicks in.
    def boom(data, *, ocr_page=None):  # noqa: ANN001, ANN202
        raise RuntimeError("corrupt pdf")

    monkeypatch.setattr(extractors.pdf, "is_available", lambda: True)
    monkeypatch.setattr(extractors.pdf, "extract_pdf", boom)
    ctx = await _ctx(db_session, type_=KnowledgeType.PDF, data=b"%PDF", filename="bad.pdf")
    with pytest.raises(RuntimeError, match="corrupt pdf"):
        await DocumentProcessor().extract(ctx)


# --- metadata merge ------------------------------------------------------
async def test_chunk_meta_merged_into_vector_metadata(db_session) -> None:
    user = await make_user(db_session)
    ws = await make_workspace(db_session, user)
    item = await make_item(db_session, user, ws)
    chunk = KnowledgeChunk(
        knowledge_item_id=item.id,
        chunk_index=0,
        text="t",
        meta={"modality": "audio", "start_ms": 500},
    )
    db_session.add(chunk)
    await db_session.flush()
    meta = build_chunk_metadata(item, chunk, get_embedder())
    assert meta["modality"] == "audio"
    assert meta["start_ms"] == 500
    assert meta["knowledge_item_id"] == str(item.id)


# --- availability probes are pure booleans ------------------------------
def test_availability_probes_return_bool() -> None:
    assert isinstance(extractors.pdf.is_available(), bool)
    assert isinstance(extractors.ocr.is_available(), bool)
    assert isinstance(extractors.transcription.is_available(), bool)
    assert isinstance(extractors.captioning.is_available(), bool)


# --- real PyMuPDF extraction (skipped if not installed) ------------------
@pytest.mark.skipif(
    importlib.util.find_spec("fitz") is None, reason="PyMuPDF not installed"
)
def test_real_pymupdf_roundtrip() -> None:
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Recall integration test page.")
    data = doc.tobytes()
    doc.close()

    result = extractors.pdf.extract_pdf(data)
    assert result.page_count == 1
    assert "Recall integration test" in result.text
