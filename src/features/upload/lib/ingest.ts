import type { QueryClient } from "@tanstack/react-query";

import { initialPipeline } from "@/lib/pipeline";
import { subscribeDocumentStatus } from "@/lib/api/document-status-channel";
import { documentService, type CreateKnowledgeInput } from "@/services";
import type { DocumentPreview } from "@/lib/api/contracts";
import type { ID, KnowledgeItem, KnowledgePipeline } from "@/types";

import {
  insertKnowledgeItem,
  replaceKnowledgeItem,
  patchKnowledgeItem,
  removeKnowledgeItem,
} from "./knowledge-cache";

let counter = 0;
function tempId(): string {
  counter += 1;
  return `temp_${Date.now()}_${counter.toString(36)}`;
}

/** Revoke a temporary blob URL once the backend supersedes it. */
function revokeIfReplaced(oldUrl: string | undefined, newUrl: string | undefined) {
  if (oldUrl && newUrl && oldUrl !== newUrl && oldUrl.startsWith("blob:")) {
    URL.revokeObjectURL(oldUrl);
  }
}

/**
 * Build the optimistic KnowledgeItem every source shares. One builder ⇒ one
 * shape: Upload, Capture and future sources (Web Import, Voice, Notes) all
 * produce the identical item, with no source-specific fields or branches.
 */
export function buildOptimisticItem(input: CreateKnowledgeInput): KnowledgeItem {
  const at = new Date().toISOString();
  return {
    id: tempId(),
    workspaceId: input.workspaceId ?? "ws_personal",
    collectionId: input.collectionId,
    type: input.type,
    pipeline: initialPipeline(at),
    title: input.title,
    content: input.content,
    excerpt: input.excerpt,
    sourceUrl: input.sourceUrl,
    previewUrl: input.previewUrl,
    thumbnailUrl: input.thumbnailUrl,
    fileUrl: input.fileUrl,
    tags: input.tags ?? [],
    people: [],
    isFavorite: false,
    createdAt: at,
    updatedAt: at,
  };
}

/** Lifecycle hooks so a caller (e.g. the Upload screen) can mirror UI state. */
export interface IngestObservers {
  onOptimistic?: (item: KnowledgeItem) => void;
  onCreated?: (tempId: ID, item: KnowledgeItem) => void;
  onPipeline?: (id: ID, pipeline: KnowledgePipeline) => void;
  onPreview?: (id: ID, preview: DocumentPreview) => void;
}

/**
 * THE single ingestion pipeline.
 *
 *   buildInput(...) → ingestInput → documentService.ingest → KnowledgeItem
 *                  → pipeline (status channel) → Knowledge caches
 *
 * Every input source funnels through here: optimistic insert into the Knowledge
 * caches, persist via the document service, then subscribe to status updates and
 * patch the caches as the RAG pipeline advances (and swap in backend previews,
 * revoking temporary object URLs). No source-specific creation logic exists.
 */
export async function ingestInput(
  qc: QueryClient,
  input: CreateKnowledgeInput,
  observers?: IngestObservers,
): Promise<KnowledgeItem> {
  const optimistic = buildOptimisticItem(input);
  insertKnowledgeItem(qc, optimistic);
  observers?.onOptimistic?.(optimistic);

  let created: KnowledgeItem;
  try {
    created = await documentService.ingest(input);
  } catch (error) {
    // Roll back the optimistic card so a failed upload never lingers as "Saving…".
    removeKnowledgeItem(qc, optimistic.id);
    throw error;
  }
  replaceKnowledgeItem(qc, optimistic.id, created);
  observers?.onCreated?.(optimistic.id, created);

  subscribeDocumentStatus(created.id, {
    onUpdate: (pipeline) => {
      patchKnowledgeItem(qc, created.id, {
        pipeline,
        updatedAt: pipeline.updatedAt,
      });
      observers?.onPipeline?.(created.id, pipeline);
    },
    onPreview: (preview) => {
      revokeIfReplaced(input.previewUrl, preview.previewUrl);
      revokeIfReplaced(input.thumbnailUrl, preview.thumbnailUrl);
      revokeIfReplaced(input.fileUrl, preview.fileUrl);
      patchKnowledgeItem(qc, created.id, {
        previewUrl: preview.previewUrl ?? input.previewUrl,
        thumbnailUrl: preview.thumbnailUrl ?? input.thumbnailUrl,
        fileUrl: preview.fileUrl ?? input.fileUrl,
      });
      observers?.onPreview?.(created.id, preview);
    },
  });

  return created;
}
