"""Event types and the job-event payload."""

from __future__ import annotations

import enum
from dataclasses import asdict, dataclass, field
from typing import Any


class EventType(str, enum.Enum):
    PROCESSING_STARTED = "processing_started"
    PROCESSING_FINISHED = "processing_finished"
    PROCESSING_FAILED = "processing_failed"
    KNOWLEDGE_READY = "knowledge_ready"
    CHUNK_CREATED = "chunk_created"
    CHUNK_EMBEDDED = "chunk_embedded"
    CHUNK_INDEXED = "chunk_indexed"
    PROGRESS = "progress"


CHANNEL = "recall:job-events"


@dataclass(slots=True)
class JobEvent:
    type: EventType
    job_id: str
    knowledge_item_id: str | None = None
    stage: str | None = None
    status: str | None = None
    progress: float = 0.0
    data: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["type"] = self.type.value
        return payload
