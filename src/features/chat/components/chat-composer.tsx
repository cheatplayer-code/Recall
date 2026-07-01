"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConversationContextStore } from "@/store";

const MAX_HEIGHT_PX = 200;

/**
 * The message composer: an auto-growing textarea with send / stop. Enter sends,
 * Shift+Enter inserts a newline. While the assistant streams, the send button
 * becomes Stop. Purely presentational — it calls `onSend` / `onStop` and holds
 * no chat logic.
 */
export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Seed the composer from an "Ask AI about this memory" handoff. The store is
  // an external system, so applying it from a subscription callback (not the
  // effect body) is the correct pattern.
  useEffect(() => {
    const apply = (prompt: string | null) => {
      if (!prompt) return;
      setValue(prompt);
      useConversationContextStore.getState().setPendingPrompt(null);
      requestAnimationFrame(() => textareaRef.current?.focus());
    };
    const initial = useConversationContextStore.getState().pendingPrompt;
    if (initial) requestAnimationFrame(() => apply(initial));
    return useConversationContextStore.subscribe((state, prev) => {
      if (state.pendingPrompt && state.pendingPrompt !== prev.pendingPrompt) {
        apply(state.pendingPrompt);
      }
    });
  }, []);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, []);

  useLayoutEffect(resize, [value, resize]);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setValue("");
  }, [value, isStreaming, onSend]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="border-t border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-input bg-card/60 px-3 py-2 shadow-soft transition-colors",
            "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={disabled}
            placeholder="Ask Recall about your memory…"
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop"
              className="shrink-0 rounded-full"
            >
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              title="Send"
              className="shrink-0 rounded-full"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        <p className="mt-1.5 px-1 text-[0.7rem] text-muted-foreground/50">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
