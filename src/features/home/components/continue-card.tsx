"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";

import { formatRelativeDate } from "@/lib/format";
import { useChatStore } from "@/store";
import { KNOWLEDGE_TYPE_META } from "@/features/knowledge/constants";
import type { Conversation, KnowledgeItem } from "@/types";

/**
 * "Continue where you left off" — resumes the user's most recent thread of
 * thought. Prefers the latest AI conversation (re-opening it in Chat), falling
 * back to the memory they most recently engaged with.
 */
export function ContinueCard({
  conversation,
  memory,
}: {
  conversation?: Conversation;
  memory?: KnowledgeItem;
}) {
  const router = useRouter();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  if (conversation) {
    return (
      <button
        type="button"
        onClick={() => {
          setActiveConversation(conversation.id);
          router.push("/chat");
        }}
        className="group flex w-full items-center gap-4 rounded-2xl bg-card/60 p-5 text-left ring-1 ring-white/[0.06] transition-colors hover:bg-card"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
          <MessageSquare className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-editorial text-base">
            {conversation.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {conversation.lastMessagePreview ?? "Pick up the conversation"}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </button>
    );
  }

  if (memory) {
    const meta = KNOWLEDGE_TYPE_META[memory.type];
    const Icon = meta.icon;
    return (
      <Link
        href={`/knowledge/${memory.id}`}
        className="group flex w-full items-center gap-4 rounded-2xl bg-card/60 p-5 ring-1 ring-white/[0.06] transition-colors hover:bg-card"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground ring-1 ring-white/10">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-editorial text-base">
            {memory.title}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {meta.label} · {formatRelativeDate(memory.lastAccessedAt ?? memory.updatedAt)}
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  }

  // Nothing to resume yet — invite the first action instead of a dead end.
  return (
    <Link
      href="/chat"
      className="group flex w-full items-center gap-4 rounded-2xl bg-card/60 p-5 ring-1 ring-white/[0.06] transition-colors hover:bg-card"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-editorial text-base">Ask your memory anything</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          Start a conversation grounded in everything you&apos;ve captured.
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
