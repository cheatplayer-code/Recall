"use client";

import { Sparkles } from "lucide-react";

import { Aurora } from "@/components/ui/aurora";

const SUGGESTED_PROMPTS = [
  "What was I working on last week?",
  "Summarize everything I saved about Recall.",
  "When was I happiest this year, and why?",
  "Find the note where I sketched the architecture.",
];

/**
 * Shown when a conversation has no messages yet: a calm welcome plus a few
 * starter prompts. Selecting one sends it immediately.
 */
export function ChatEmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="relative w-full max-w-xl text-center">
        <Aurora className="rounded-3xl" />
        <div className="relative">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-aurora text-primary-foreground ring-1 ring-white/10">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <h2 className="font-editorial mt-5 text-2xl leading-tight">
            Ask your memory anything
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Recall searches everything you&rsquo;ve saved and answers with sources you
            can open.
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPrompt(prompt)}
                className="rounded-xl border border-border/70 bg-card/50 px-4 py-3 text-left text-sm text-foreground/85 shadow-soft transition-colors hover:border-border hover:bg-card"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
