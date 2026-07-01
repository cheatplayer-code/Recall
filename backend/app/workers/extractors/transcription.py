"""Audio/video transcription via openai-whisper. Lazy singleton per model."""

from __future__ import annotations

import importlib.util
import os
import tempfile
import threading
from dataclasses import dataclass, field
from typing import Any

import structlog

logger = structlog.get_logger(__name__)

_models: dict[str, object] = {}
_lock = threading.Lock()


@dataclass(slots=True)
class Transcription:
    text: str
    language: str | None = None
    segments: list[dict[str, Any]] = field(default_factory=list)


def is_available() -> bool:
    return importlib.util.find_spec("whisper") is not None


def _get_model(model_name: str) -> object:
    cached = _models.get(model_name)
    if cached is not None:
        return cached
    with _lock:
        cached = _models.get(model_name)
        if cached is not None:
            return cached
        import whisper  # noqa: PLC0415

        logger.info("transcription.load_model", model=model_name)
        model = whisper.load_model(model_name)
        _models[model_name] = model
        return model


def transcribe(data: bytes, model_name: str = "large-v3", *, suffix: str = ".bin") -> Transcription:
    """Transcribe audio/video bytes. Returns text, language, and timed segments.

    Whisper decodes via ffmpeg from a file path, so bytes are written to a temp
    file first. Raises if whisper is unavailable — callers gate on
    :func:`is_available`.
    """
    model = _get_model(model_name)
    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name
        result = model.transcribe(tmp_path)  # type: ignore[attr-defined]
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    segments = [
        {
            "start_ms": int(seg.get("start", 0.0) * 1000),
            "end_ms": int(seg.get("end", 0.0) * 1000),
            "text": seg.get("text", "").strip(),
        }
        for seg in result.get("segments", [])
    ]
    return Transcription(
        text=str(result.get("text", "")).strip(),
        language=result.get("language"),
        segments=segments,
    )
