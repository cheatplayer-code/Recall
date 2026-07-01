"""Image captioning via Florence-2.

Florence-2-base is chosen over BLIP2-opt-2.7b: it is ~0.23B params (vs 2.7B),
runs acceptably on CPU, and is a unified vision model whose task prompts also
cover OCR/detection if we extend extraction later — all behind one lazy load.
Imported lazily so the package installs without the ``captioning`` extra.
"""

from __future__ import annotations

import importlib.util
import io
import threading

import structlog

logger = structlog.get_logger(__name__)

_CAPTION_TASK = "<DETAILED_CAPTION>"

# Singleton (model, processor) keyed by model name.
_models: dict[str, tuple[object, object]] = {}
_lock = threading.Lock()


def is_available() -> bool:
    return (
        importlib.util.find_spec("transformers") is not None
        and importlib.util.find_spec("PIL") is not None
    )


def _get_model(model_name: str) -> tuple[object, object]:
    cached = _models.get(model_name)
    if cached is not None:
        return cached
    with _lock:
        cached = _models.get(model_name)
        if cached is not None:
            return cached
        from transformers import AutoModelForCausalLM, AutoProcessor  # noqa: PLC0415

        logger.info("captioning.load_model", model=model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)
        processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
        _models[model_name] = (model, processor)
        return model, processor


def caption_image(data: bytes, model_name: str = "microsoft/Florence-2-base") -> str:
    """Return a natural-language caption for image bytes.

    Raises if transformers/Pillow are unavailable — callers gate on
    :func:`is_available`.
    """
    from PIL import Image  # noqa: PLC0415

    model, processor = _get_model(model_name)
    image = Image.open(io.BytesIO(data)).convert("RGB")
    inputs = processor(text=_CAPTION_TASK, images=image, return_tensors="pt")  # type: ignore[operator]
    generated = model.generate(  # type: ignore[attr-defined]
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=256,
        num_beams=3,
        do_sample=False,
    )
    raw = processor.batch_decode(generated, skip_special_tokens=False)[0]  # type: ignore[attr-defined]
    parsed = processor.post_process_generation(  # type: ignore[attr-defined]
        raw, task=_CAPTION_TASK, image_size=(image.width, image.height)
    )
    caption = parsed.get(_CAPTION_TASK, "")
    return caption.strip() if isinstance(caption, str) else str(caption)
