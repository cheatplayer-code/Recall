import { documentService } from "@/services";
import type { DocumentPreview } from "@/lib/api/contracts";
import type { ID, KnowledgePipeline } from "@/types";

/**
 * Subscribe to a document's processing status until it reaches a terminal
 * stage. THE SWAP POINT: this is the only place that knows *how* updates
 * arrive. Today it polls `GET /documents/{id}/status`; replacing the body with
 * an SSE `EventSource` or a WebSocket changes nothing upstream — the hooks, the
 * store and the UI keep consuming `onUpdate`.
 *
 * Returns an unsubscribe function.
 */
const POLL_INTERVAL_MS = 1200;

export interface DocumentStatusHandlers {
  onUpdate: (pipeline: KnowledgePipeline) => void;
  /** Fired when the backend has rendered previews — replaces temp object URLs. */
  onPreview?: (preview: DocumentPreview) => void;
  onSettled?: (pipeline: KnowledgePipeline) => void;
  onError?: (error: unknown) => void;
}

export function subscribeDocumentStatus(
  id: ID,
  handlers: DocumentStatusHandlers,
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const poll = async () => {
    if (cancelled) return;
    try {
      const status = await documentService.getStatus(id);
      if (status) {
        const { pipeline, preview } = status;
        handlers.onUpdate(pipeline);
        if (preview) handlers.onPreview?.(preview);
        if (pipeline.stage === "ready" || pipeline.stage === "failed") {
          handlers.onSettled?.(pipeline);
          return;
        }
      }
    } catch (error) {
      handlers.onError?.(error);
    }
    timer = setTimeout(poll, POLL_INTERVAL_MS);
  };

  void poll();

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}
