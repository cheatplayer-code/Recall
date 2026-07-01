import type {
  Citation,
  DocumentReference,
  ID,
  RetrievedChunk,
} from "@/types";

/**
 * Wire contracts for the RAG chat endpoint. The frontend never owns the LLM —
 * it sends a question plus retrieval context and renders whatever streams back.
 *
 * Field names are camelCase; FastAPI is expected to serialize with a camelCase
 * alias generator (or a single mapping point can be added here later).
 */

/** POST /chat/stream request body. */
export interface ChatStreamRequestBody {
  conversationId: ID;
  message: string;
  /** Memories attached as standing context — the backend retrieves over these. */
  attachedMemoryIds?: ID[];
  /** Workspace scope for retrieval. */
  workspaceId?: ID;
}

/**
 * One server-sent frame from POST /chat/stream, delivered as a `data:` JSON
 * line. Ordering: `retrieval` (chunks + references land first) → many `token`
 * → `citations` → `done`. `error` may arrive at any point.
 */
export type ChatStreamEvent =
  | { type: "retrieval"; chunks: RetrievedChunk[]; references: DocumentReference[] }
  | { type: "token"; value: string }
  | { type: "citations"; citations: Citation[] }
  | { type: "done" }
  | { type: "error"; message: string };

/** The grounding for one assistant turn: retrieval frame + finalized citations. */
export interface ChatStreamGrounding {
  citations: Citation[];
  chunks: RetrievedChunk[];
  references: DocumentReference[];
}

/**
 * Handlers the UI-facing streaming interface drives. Ordering: `onMetadata`
 * (retrieval landed) → many `onToken` → `onDone` (with finalized citations), or
 * `onError`. Stable across mock and real backends.
 */
export interface ChatStreamHandlers {
  onToken: (token: string) => void;
  onMetadata?: (
    grounding: Pick<ChatStreamGrounding, "chunks" | "references">,
  ) => void;
  onDone: (grounding: ChatStreamGrounding) => void;
  onError: (error: unknown) => void;
}
