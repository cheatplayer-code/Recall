"use client";

import { Paperclip, X } from "lucide-react";

import { useConversationContext } from "../hooks/use-conversation-context";

/**
 * Shows the memories attached to the current conversation as context chips,
 * just above the composer. Decoupled from Knowledge — it renders the shared
 * `AttachedMemory` model and never imports the Knowledge feature.
 */
export function AttachedContextBar() {
  const { attachedMemories, detachMemory } = useConversationContext();

  if (attachedMemories.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-1 pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground/55">
          <Paperclip className="size-3" aria-hidden="true" /> Context
        </span>
        {attachedMemories.map((memory) => (
          <span
            key={memory.memoryId}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground/85"
          >
            <span className="max-w-[12rem] truncate">{memory.title}</span>
            <button
              type="button"
              onClick={() => detachMemory(memory.memoryId)}
              aria-label={`Remove ${memory.title} from context`}
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
