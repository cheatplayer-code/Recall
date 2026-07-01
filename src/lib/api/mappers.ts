/**
 * Backend → frontend adapters.
 *
 * The FastAPI backend serializes camelCase DTOs that are close to, but not
 * identical to, the app's domain types (the frontend model is richer: it carries
 * a derived `pipeline`, `rag` facets, `people`, etc.). These mappers are the ONE
 * place that knows the wire shape, so services stay one-liners and components
 * never change. If a backend field is renamed, only this file changes.
 */
import {
  failedPipeline,
  processingPipeline,
  readyPipeline,
} from "@/lib/pipeline";
import type { DocumentPreview, DocumentStatusResponse } from "@/lib/api/contracts";
import type {
  AIEnrichment,
  ChatMessage,
  ChatRole,
  Citation,
  Collection,
  Conversation,
  DocumentReference,
  EmbeddingStatus,
  ISODateString,
  KnowledgeItem,
  KnowledgePipeline,
  KnowledgeType,
  MessageStatus,
  PipelineStage,
  RetrievedChunk,
  User,
  Workspace,
} from "@/types";

/* ─────────────────────────── Backend DTOs ─────────────────────────── */

export interface KnowledgeItemDTO {
  id: string;
  workspaceId: string;
  collectionId: string | null;
  userId: string;
  type: KnowledgeType;
  title: string;
  content: string | null;
  excerpt: string | null;
  sourceUrl: string | null;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  status: PipelineStage;
  embeddingStatus: EmbeddingStatus;
  chunkCount: number;
  pageCount: number | null;
  tags: string[];
  ai: AIEnrichment | null;
  isFavorite: boolean;
  occurredAt: string | null;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProcessingStageEntryDTO {
  stage: string;
  status: string;
  at?: string;
}

export interface ProcessingStatusDTO {
  jobId: string | null;
  status: string | null;
  stage: PipelineStage;
  progress: number; // 0..1 (already normalized by the backend)
  error: string | null;
  retryCount: number;
  stages: ProcessingStageEntryDTO[];
  startedAt: string | null;
  finishedAt: string | null;
  preview: DocumentPreview | null;
}

export interface UploadResponseDTO {
  item: KnowledgeItemDTO;
  uploadJob: unknown;
  processingJob: unknown;
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDTO {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDTO {
  id: string;
  title: string;
  lastMessagePreview: string | null;
  workspaceId: string | null;
  attachedMemoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  status: MessageStatus;
  error: string | null;
  citations: Record<string, unknown>[] | null;
  chunks: Record<string, unknown>[] | null;
  references: Record<string, unknown>[] | null;
  createdAt: string;
}

/* ─────────────────────────── Knowledge ─────────────────────────── */

/**
 * Derive the rich `KnowledgePipeline` from the backend's flat `status`. The UI
 * is built around the detailed pipeline; the backend reports a single stage, so
 * we expand it here using the same helpers the pipeline view uses.
 */
function pipelineFromStatus(
  status: PipelineStage,
  at: ISODateString,
  error?: string | null,
): KnowledgePipeline {
  if (status === "ready") return readyPipeline(at);
  if (status === "failed") {
    return failedPipeline(at, "processing", error || "Processing failed.");
  }
  return processingPipeline(at, status);
}

export function mapKnowledgeItem(dto: KnowledgeItemDTO): KnowledgeItem {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    collectionId: dto.collectionId ?? undefined,
    type: dto.type,
    pipeline: pipelineFromStatus(dto.status, dto.updatedAt),
    title: dto.title,
    content: dto.content ?? undefined,
    excerpt: dto.excerpt ?? undefined,
    sourceUrl: dto.sourceUrl ?? undefined,
    previewUrl: dto.previewUrl ?? undefined,
    thumbnailUrl: dto.thumbnailUrl ?? undefined,
    fileUrl: dto.fileUrl ?? undefined,
    occurredAt: dto.occurredAt ?? undefined,
    lastAccessedAt: dto.lastAccessedAt ?? undefined,
    tags: dto.tags ?? [],
    people: [],
    ai: dto.ai ?? undefined,
    rag: {
      documentId: dto.id,
      embeddingStatus: dto.embeddingStatus,
      chunkCount: dto.chunkCount,
      pageCount: dto.pageCount ?? undefined,
      processingStage: dto.status,
    },
    isFavorite: dto.isFavorite,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapDocumentStatus(dto: ProcessingStatusDTO): DocumentStatusResponse {
  const cancelled = dto.status === "cancelled";
  const stage: PipelineStage = cancelled ? "failed" : dto.stage;
  const at = dto.finishedAt ?? dto.startedAt ?? new Date().toISOString();
  const base = pipelineFromStatus(
    stage,
    at,
    cancelled ? "Processing was cancelled." : dto.error,
  );
  const pipeline: KnowledgePipeline = { ...base, progress: dto.progress };
  return { pipeline, preview: dto.preview ?? undefined };
}

/* ─────────────────────────── Identity / spaces ─────────────────────────── */

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workspace";
}

export function mapUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.fullName ?? dto.email.split("@")[0],
    email: dto.email,
    avatarUrl: dto.avatarUrl ?? undefined,
    plan: "free",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapWorkspace(dto: WorkspaceDTO): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    slug: slugify(dto.name),
    description: dto.description ?? undefined,
    itemCount: 0,
    collectionCount: 0,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCollection(dto: CollectionDTO): Collection {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    name: dto.name,
    description: dto.description ?? undefined,
    itemCount: 0,
    coverImageUrls: [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/* ─────────────────────────── Chat ─────────────────────────── */

export function mapConversation(dto: ConversationDTO): Conversation {
  return {
    id: dto.id,
    title: dto.title,
    lastMessagePreview: dto.lastMessagePreview ?? undefined,
    workspaceId: dto.workspaceId ?? undefined,
    attachedMemoryIds: dto.attachedMemoryIds ?? [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapMessage(dto: MessageDTO): ChatMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    role: dto.role,
    content: dto.content,
    status: dto.status,
    error: dto.error ?? undefined,
    citations: (dto.citations ?? undefined) as Citation[] | undefined,
    chunks: (dto.chunks ?? undefined) as RetrievedChunk[] | undefined,
    references: (dto.references ?? undefined) as DocumentReference[] | undefined,
    createdAt: dto.createdAt,
  };
}
