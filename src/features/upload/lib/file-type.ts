import type { KnowledgeType } from "@/types";

/** File kinds the Upload experience accepts. */
export const ACCEPTED_FILE_TYPES =
  "application/pdf,image/*,audio/*,video/*,text/plain,.md,.markdown,.txt";

/** Map a dropped file to the Knowledge type it becomes. */
export function knowledgeTypeFromFile(file: File): KnowledgeType {
  const type = file.type;
  if (type.startsWith("image/")) return "photo";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "voice";
  if (type === "application/pdf") return "pdf";
  return "note"; // text / markdown / plain
}

/** Optimistic preview URLs derived from a local file (revoked when replaced). */
export interface FilePreviewUrls {
  previewUrl?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
}

/**
 * Build temporary object URLs so a user sees their upload immediately, before
 * the backend finishes. Images are renderable now (preview + thumbnail); other
 * kinds keep `fileUrl` for open/download and wait for a backend-rendered preview.
 */
export function objectUrlsForFile(
  file: File,
  type: KnowledgeType,
): FilePreviewUrls {
  const fileUrl = URL.createObjectURL(file);
  if (type === "photo") {
    return { previewUrl: fileUrl, thumbnailUrl: fileUrl, fileUrl };
  }
  return { fileUrl };
}

/** A readable title from a file name ("trip-notes.pdf" → "trip notes"). */
export function titleFromFileName(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || name
  );
}
