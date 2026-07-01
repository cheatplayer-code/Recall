import type {
  ID,
  KnowledgeItem,
  KnowledgePipeline,
  KnowledgeType,
} from "@/types";

/** Multipart POST /documents/upload request. */
export interface DocumentUploadRequest {
  file: File;
  type: KnowledgeType;
  title: string;
  excerpt?: string;
  workspaceId?: ID;
  collectionId?: ID;
}

/**
 * Renderable artifacts the backend derives from an uploaded document. The same
 * shape the frontend builds optimistically from an object URL, so the backend's
 * values can drop in and replace the temporary ones.
 */
export interface DocumentPreview {
  /** The original file, for download / open. */
  fileUrl?: string;
  /** A renderable preview: the image itself, a PDF first-page render, a video poster. */
  previewUrl?: string;
  /** A small thumbnail for cards. */
  thumbnailUrl?: string;
  pageCount?: number;
}

/** POST /documents/upload response — the created (pending) memory. */
export interface DocumentUploadResponse {
  item: KnowledgeItem;
}

/** GET /documents/:id/status response. */
export interface DocumentStatusResponse {
  pipeline: KnowledgePipeline;
  /** Present once the backend has rendered previews (replaces temp object URLs). */
  preview?: DocumentPreview;
}
