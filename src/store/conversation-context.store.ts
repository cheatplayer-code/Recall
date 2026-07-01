import { create } from "zustand";

import type { AttachedMemory, ID } from "@/types";

/**
 * Shared cross-feature state that ties Knowledge and AI Chat together: the
 * memories attached to the conversation currently in view, the workspace it
 * belongs to, and a prompt seeded from a "Ask AI about this memory" handoff.
 *
 * This is deliberately separate from `chat.store` (which owns the live
 * streaming thread): attachments are conversation *context*, not message state,
 * and they originate outside the Chat feature. The persisted source of truth is
 * `Conversation.attachedMemoryIds`; this store is the live UI mirror.
 */
interface ConversationContextState {
  /** Attached memories for the conversation currently in view. */
  attachedMemories: AttachedMemory[];
  /** Workspace context for the active/next conversation. */
  workspaceId: ID | null;
  /** A prompt to seed the composer with (set by the Ask-AI handoff). */
  pendingPrompt: string | null;

  setAttachedMemories: (memories: AttachedMemory[]) => void;
  attachMemory: (memory: AttachedMemory) => void;
  detachMemory: (memoryId: ID) => void;
  setWorkspaceId: (workspaceId: ID | null) => void;
  setPendingPrompt: (prompt: string | null) => void;
  reset: () => void;
}

export const useConversationContextStore = create<ConversationContextState>(
  (set) => ({
    attachedMemories: [],
    workspaceId: null,
    pendingPrompt: null,

    setAttachedMemories: (attachedMemories) => set({ attachedMemories }),

    attachMemory: (memory) =>
      set((s) =>
        s.attachedMemories.some((m) => m.memoryId === memory.memoryId)
          ? s
          : { attachedMemories: [...s.attachedMemories, memory] },
      ),

    detachMemory: (memoryId) =>
      set((s) => ({
        attachedMemories: s.attachedMemories.filter(
          (m) => m.memoryId !== memoryId,
        ),
      })),

    setWorkspaceId: (workspaceId) => set({ workspaceId }),

    setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),

    reset: () =>
      set({ attachedMemories: [], workspaceId: null, pendingPrompt: null }),
  }),
);
