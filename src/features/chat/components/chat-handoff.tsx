"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { knowledgeService } from "@/services";
import { useConversationContextStore } from "@/store";

/**
 * Consumes the `?memory={id}` deep link from "Ask AI about this memory":
 * resolves the memory through the service layer, attaches it to the shared
 * conversation context, seeds the composer prompt, then strips the param so the
 * URL stays clean and the handoff runs once. Renders nothing.
 *
 * This is the single owner of the Knowledge → Chat handoff. Knowledge only ever
 * produced a URL; all coupling stops here, behind the service + shared store.
 */
export function ChatHandoff() {
  const params = useSearchParams();
  const router = useRouter();
  const memoryId = params.get("memory");
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!memoryId || handled.current === memoryId) return;
    handled.current = memoryId;
    let cancelled = false;

    void (async () => {
      const item = await knowledgeService.getById(memoryId);
      if (cancelled) return;
      if (item) {
        const store = useConversationContextStore.getState();
        store.attachMemory({
          memoryId: item.id,
          title: item.title,
          type: item.type,
          workspaceId: item.workspaceId,
        });
        store.setWorkspaceId(item.workspaceId);
        store.setPendingPrompt(`About "${item.title}": `);
      }
      router.replace("/chat");
    })();

    return () => {
      cancelled = true;
    };
  }, [memoryId, router]);

  return null;
}
