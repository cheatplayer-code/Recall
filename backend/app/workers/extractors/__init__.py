"""Modality extractors plugged into DocumentProcessor.extract.

Each submodule lazily imports its ML backend and exposes ``is_available()`` so
the processor can fall back to deterministic placeholders when a backend is
either disabled by config or not installed.
"""

from __future__ import annotations

from app.workers.extractors import captioning, ocr, pdf, transcription
from app.workers.extractors.pdf import PdfExtraction
from app.workers.extractors.transcription import Transcription

__all__ = [
    "pdf",
    "ocr",
    "transcription",
    "captioning",
    "PdfExtraction",
    "Transcription",
]
