"""Knowledge item + document/processing schemas."""

from __future__ import annotations

import datetime
import uuid

from app.schemas.common import CamelModel


class AIEnrichmentSchema(CamelModel):
    """The per-memory AI facet (mirrors ``AIEnrichment`` in the frontend).

    Stored on ``KnowledgeItem.ai`` as a JSON dict with snake_case keys;
    ``CamelModel`` (``populate_by_name``) validates those and serializes the
    camelCase shape (``keyMoments``, ``actionItems``) the client renders.
    """

    title: str | None = None
    summary: str | None = None
    # Free-form on the read side so unexpected stored values never 500 a list;
    # the enricher only ever writes positive|neutral|negative|mixed.
    mood: str | None = None
    topics: list[str] = []
    key_moments: list[str] = []
    action_items: list[str] = []


class KnowledgeItemSchema(CamelModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    collection_id: uuid.UUID | None = None
    user_id: uuid.UUID
    type: str
    title: str
    content: str | None = None
    excerpt: str | None = None
    source_url: str | None = None
    preview_url: str | None = None
    thumbnail_url: str | None = None
    file_url: str | None = None
    status: str
    embedding_status: str
    chunk_count: int
    page_count: int
    tags: list[str]
    ai: AIEnrichmentSchema | None = None
    is_favorite: bool
    occurred_at: datetime.datetime | None = None
    last_accessed_at: datetime.datetime | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class KnowledgeItemCreate(CamelModel):
    workspace_id: uuid.UUID
    type: str = "note"
    title: str
    content: str | None = None
    excerpt: str | None = None
    source_url: str | None = None
    tags: list[str] = []
    collection_id: uuid.UUID | None = None


class KnowledgeItemUpdate(CamelModel):
    title: str | None = None
    content: str | None = None
    excerpt: str | None = None
    tags: list[str] | None = None
    is_favorite: bool | None = None
    collection_id: uuid.UUID | None = None


class ProcessingJobSchema(CamelModel):
    id: uuid.UUID
    knowledge_item_id: uuid.UUID | None = None
    status: str
    stage: str
    progress: float
    error: str | None = None
    retry_count: int
    max_retries: int


class UploadJobSchema(CamelModel):
    id: uuid.UUID
    filename: str
    content_type: str | None = None
    size_bytes: int
    checksum: str | None = None
    storage_key: str | None = None
    public_url: str | None = None
    status: str


class UploadResponse(CamelModel):
    item: KnowledgeItemSchema
    upload_job: UploadJobSchema
    processing_job: ProcessingJobSchema


class UrlUploadRequest(CamelModel):
    source_url: str
    workspace_id: uuid.UUID | None = None


class ProcessingStatus(CamelModel):
    job_id: uuid.UUID
    status: str
    stage: str
    progress: float
    error: str | None = None
    retry_count: int
    stages: list[dict] = []
    preview: str | None = None
