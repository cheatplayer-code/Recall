import type { HasTimestamps, ID, ISODateString } from "./common";

/** Who authored a message. Error and loading are *statuses*, not roles. */
export type ChatRole = "user" | "assistant" | "system";

/** Lifecycle of a message — drives loading, typing, streaming and error UI. */
export type MessageStatus = "pending" | "streaming" | "complete" | "error";

/**
 * A grounded reference the assistant used to answer. This is the reusable
 * citation contract the UI is built around: document, page, confidence and a
 * target the "open document" action can later route to.
 */
export interface Citation {
  id: ID;
  documentId: ID;
  documentName: string;
  /** 1-based page within the source document, when known. */
  page?: number;
  /** Answer confidence in [0, 1]. */
  confidence?: number;
  excerpt?: string;
}

/** A raw passage pulled from the vector store during retrieval. */
export interface RetrievedChunk {
  id: ID;
  documentId: ID;
  documentName: string;
  content: string;
  /** Similarity score in [0, 1]. */
  score?: number;
}

/** A document the answer drew on, surfaced as a reference. */
export interface DocumentReference {
  id: ID;
  documentId: ID;
  name: string;
  type?: string;
}

/**
 * The retrieval frame the backend attaches to an assistant turn (the "R" in
 * RAG). Kept separate so the stream channel can deliver it independently of the
 * generated tokens — retrieval lands first, citations are finalized last.
 */
export interface MessageGrounding {
  citations?: Citation[];
  chunks?: RetrievedChunk[];
  references?: DocumentReference[];
}

export interface ChatMessage extends MessageGrounding {
  id: ID;
  conversationId: ID;
  role: ChatRole;
  content: string;
  createdAt: ISODateString;
  status: MessageStatus;
  /** Present when status === "error". */
  error?: string;
}

export interface Conversation extends HasTimestamps {
  id: ID;
  title: string;
  lastMessagePreview?: string;
  /** Workspace this conversation belongs to (backend-owned). */
  workspaceId?: ID;
  /**
   * Memories attached as standing context for retrieval. Stored as ids — the
   * backend resolves them to chunks/citations; the UI resolves them to
   * {@link AttachedMemory} chips. This is how a conversation "remembers" which
   * memories it was started from.
   */
  attachedMemoryIds?: ID[];
}
