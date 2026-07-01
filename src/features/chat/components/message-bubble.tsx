"use client";

import { memo } from "react";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";

import { useCopy } from "../hooks/use-copy";
import { Markdown } from "./markdown/markdown";
import { RagPanel } from "./rag-panel";
import { TypingIndicator } from "./typing-indicator";
import { CopyButton } from "./copy-button";

interface MessageBubbleProps {
  message: ChatMessage;
  /** True only for the last assistant message (enables Regenerate). */
  isLast?: boolean;
  onRegenerate?: () => void;
}

/**
 * Renders one message, branching on role × status:
 *   user      → right-aligned bubble
 *   assistant → markdown + RAG panel + actions; typing indicator while pending
 *   system    → centered, muted notice
 *   error     → inline error affordance with Retry
 *
 * Memoized: during streaming only the active assistant message's props change,
 * so finished bubbles never re-render — the key to long, smooth threads.
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  isLast = false,
  onRegenerate,
}: MessageBubbleProps) {
  const { copied, copy } = useCopy();

  if (message.role === "system") {
    return (
      <div className="py-2 text-center text-xs text-muted-foreground">
        {message.content}
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground ring-1 ring-primary/15">
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  const isPending = message.status === "pending";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-aurora text-primary-foreground ring-1 ring-white/10">
        <Sparkles className="size-3.5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        {isError ? (
          <div className="flex flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {message.error ?? "The assistant couldn't finish that response."}
            </p>
            {onRegenerate && (
              <Button variant="ghost" size="sm" onClick={onRegenerate}>
                <RefreshCw className="size-3.5" /> Try again
              </Button>
            )}
          </div>
        ) : isPending && message.content === "" ? (
          <div className="flex h-7 items-center">
            <TypingIndicator />
          </div>
        ) : (
          <>
            <Markdown content={message.content} />
            {/* RAG provenance — present (collapsed) as soon as it streams in. */}
            <RagPanel
              citations={message.citations}
              chunks={message.chunks}
              references={message.references}
            />

            {!isStreaming && (
              <div className="mt-2 flex items-center gap-1">
                <CopyButton copied={copied} onCopy={() => copy(message.content)} />
                {isLast && onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onRegenerate}
                    aria-label="Regenerate response"
                    title="Regenerate"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
