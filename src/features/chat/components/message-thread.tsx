"use client";

import { ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";

import { useAutoScroll } from "../hooks/use-auto-scroll";
import { MessageBubble } from "./message-bubble";

/**
 * The scrollable conversation. Renders memoized bubbles and stays pinned to the
 * bottom while near it (see `useAutoScroll`). This is the single seam where a
 * windowing layer (`@tanstack/react-virtual`) would slot in for very long
 * threads — the bubbles are already memoized and keyed, so only this map and the
 * scroll container would change; nothing upstream.
 */
export function MessageThread({
  messages,
  onRegenerate,
}: {
  messages: ChatMessage[];
  onRegenerate?: () => void;
}) {
  // Depend on count + the tail's length so streamed tokens keep us pinned.
  const tail = messages[messages.length - 1];
  const { ref, onScroll, stuck, scrollToBottom } = useAutoScroll<HTMLDivElement>(
    `${messages.length}:${tail?.content.length ?? 0}`,
  );

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={message.id === lastAssistantId}
              onRegenerate={onRegenerate}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity",
          stuck ? "opacity-0" : "opacity-100",
        )}
      >
        <Button
          variant="outline"
          size="icon-sm"
          onClick={scrollToBottom}
          aria-label="Scroll to latest"
          className={cn("pointer-events-auto rounded-full shadow-soft", stuck && "pointer-events-none")}
        >
          <ArrowDown className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
