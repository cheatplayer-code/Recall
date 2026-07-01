"use client";

import { useCallback } from "react";

import { chatService } from "@/services";
import { useChatStore, useConversationContextStore } from "@/store";
import type { AttachedMemory, ID } from "@/types";

/**
 * Reads and mutates the active conversation's attached-memory context. Writes
 * go to the shared store (live UI) and, when a conversation exists, are also
 * persisted through the service so the conversation "remembers" its sources.
 */
export function useConversationContext() {
  const attachedMemories = useConversationContextStore(
    (s) => s.attachedMemories,
  );
  const attach = useConversationContextStore((s) => s.attachMemory);
  const detach = useConversationContextStore((s) => s.detachMemory);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  const attachMemory = useCallback(
    (memory: AttachedMemory) => {
      attach(memory);
      if (activeConversationId) {
        void chatService.attachMemory(activeConversationId, memory.memoryId);
      }
    },
    [attach, activeConversationId],
  );

  const detachMemory = useCallback(
    (memoryId: ID) => {
      detach(memoryId);
      if (activeConversationId) {
        void chatService.detachMemory(activeConversationId, memoryId);
      }
    },
    [detach, activeConversationId],
  );

  return { attachedMemories, attachMemory, detachMemory };
}
