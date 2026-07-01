"""PDF extraction via PyMuPDF (fitz).

Born-digital text is read directly; scanned pages (little/no text) optionally
fall back to OCR. The model/library is imported lazily so the package installs
without the ``pdf`` extra.
"""

from __future__ import annotations

import importlib.util
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import structlog

logger = structlog.get_logger(__name__)

# Pages with fewer than this many characters of embedded text are treated as
# scanned and routed to OCR (when OCR is enabled).
_SCANNED_TEXT_THRESHOLD = 50


@dataclass(slots=True)
class PdfExtraction:
    text: str
    page_count: int
    pages: list[str] = field(default_factory=list)
    sections: list[dict[str, Any]] = field(default_factory=list)


def is_available() -> bool:
    return importlib.util.find_spec("fitz") is not None


def extract_pdf(
    data: bytes,
    *,
    ocr_page: Callable[[bytes], str] | None = None,
) -> PdfExtraction:
    """Extract text, page count, and TOC sections from PDF bytes.

    ``ocr_page`` (if provided) is called with PNG bytes for any page whose
    embedded text is below the scanned-page threshold. Raises if PyMuPDF is
    unavailable — callers gate on :func:`is_available` and fall back.
    """
    import fitz  # noqa: PLC0415

    doc = fitz.open(stream=data, filetype="pdf")
    try:
        pages: list[str] = []
        for page in doc:
            text = page.get_text().strip()
            if len(text) < _SCANNED_TEXT_THRESHOLD and ocr_page is not None:
                try:
                    png = page.get_pixmap().tobytes("png")
                    text = ocr_page(png).strip()
                except Exception:  # noqa: BLE001 - OCR failure degrades, not fatal
                    logger.warning("pdf.ocr_page_failed", page=page.number, exc_info=True)
            pages.append(text)

        sections = [
            {"title": title, "page": page_no, "level": level}
            for level, title, page_no in (doc.get_toc() or [])
        ]
        page_count = doc.page_count
    finally:
        doc.close()

    return PdfExtraction(
        text="\n\n".join(pages),
        page_count=page_count,
        pages=pages,
        sections=sections,
    )
