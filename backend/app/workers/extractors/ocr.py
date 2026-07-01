"""OCR via PaddleOCR. Lazy module-level singleton keyed by language."""

from __future__ import annotations

import importlib.util
import threading

import structlog

logger = structlog.get_logger(__name__)

_models: dict[str, object] = {}
_lock = threading.Lock()


def is_available() -> bool:
    return importlib.util.find_spec("paddleocr") is not None


def _get_model(lang: str) -> object:
    cached = _models.get(lang)
    if cached is not None:
        return cached
    with _lock:
        cached = _models.get(lang)
        if cached is not None:
            return cached
        from paddleocr import PaddleOCR  # noqa: PLC0415

        logger.info("ocr.load_model", lang=lang)
        model = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False)
        _models[lang] = model
        return model


def ocr_image(data: bytes, lang: str = "en") -> str:
    """Run OCR on raw image bytes and return the concatenated text.

    Raises if PaddleOCR/opencv are unavailable — callers gate on
    :func:`is_available`.
    """
    import cv2  # noqa: PLC0415
    import numpy as np  # noqa: PLC0415

    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return ""
    model = _get_model(lang)
    result = model.ocr(image, cls=True)  # type: ignore[attr-defined]
    if not result or result[0] is None:
        return ""
    lines: list[str] = []
    for entry in result[0]:
        # entry == [box, (text, confidence)] in PaddleOCR 2.x.
        try:
            lines.append(entry[1][0])
        except (IndexError, TypeError):  # pragma: no cover - version drift guard
            continue
    return "\n".join(lines)
