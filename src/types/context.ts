import type { ID } from "./common";
import type { KnowledgeType } from "./knowledge";

/**
 * A memory attached to a conversation as standing context — the bridge model
 * between Knowledge and AI Chat. Carries just enough to render a context chip
 * without refetching; the backend resolves `memoryId` to chunks/citations.
 *
 * Lives in its own module so both domains can share it without a cycle:
 * Knowledge never imports Chat, Chat never imports Knowledge — both import this.
 */
export interface AttachedMemory {
  memoryId: ID;
  title: string;
  type: KnowledgeType;
  workspaceId?: ID;
}
