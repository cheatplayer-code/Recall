import { http, HttpError } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import {
  mapDocumentStatus,
  mapKnowledgeItem,
  type ProcessingStatusDTO,
  type UploadResponseDTO,
} from "@/lib/api/mappers";
import type { DocumentStatusResponse } from "@/lib/api/contracts";
import type { ID, KnowledgeItem } from "@/types";

import type { CreateKnowledgeInput } from "./knowledge.service";

/**
 * Document ingestion data access — talks to the real FastAPI pipeline.
 *
 * `ingest()` routes by input kind:
 *   - a real file  → `POST /documents` (multipart) — the worker processes it,
 *   - a URL        → `POST /documents/url`,
 *   - plain text   → a synthesized `.txt` file → `POST /documents`, so notes are
 *                    chunked/embedded and become searchable like any document.
 *
 * `getStatus()` polls `GET /documents/{id}/status`, which reflects the worker's
 * real progress. The status channel, hooks and UI consume the same contract as
 * before — only these two bodies are now live.
 */

function textFile(input: CreateKnowledgeInput): File {
  const body = input.content?.trim() || input.title;
  return new File([body], `${input.title || "note"}.txt`, { type: "text/plain" });
}

async function uploadFile(file: File, workspaceId?: ID): Promise<KnowledgeItem> {
  const form = new FormData();
  form.append("file", file);
  if (workspaceId) form.append("workspaceId", workspaceId);
  const res = await http.post<UploadResponseDTO>(endpoints.documents.upload, form);
  return mapKnowledgeItem(res.item);
}

export const documentService = {
  ingest: async (input: CreateKnowledgeInput): Promise<KnowledgeItem> => {
    if (input.file) {
      return uploadFile(input.file, input.workspaceId);
    }
    if (input.sourceUrl) {
      const res = await http.post<UploadResponseDTO>(endpoints.documents.url, {
        sourceUrl: input.sourceUrl,
        workspaceId: input.workspaceId,
      });
      return mapKnowledgeItem(res.item);
    }
    // Plain text/note: ingest as a text document so it flows through processing.
    return uploadFile(textFile(input), input.workspaceId);
  },

  /** Current processing status for a document, polled by the status channel. */
  getStatus: async (id: ID): Promise<DocumentStatusResponse | null> => {
    try {
      const dto = await http.get<ProcessingStatusDTO>(endpoints.documents.status(id));
      return mapDocumentStatus(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },
};
