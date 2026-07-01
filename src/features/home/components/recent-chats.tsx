"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { formatRelativeDate } from "@/lib/format";
import { useChatStore } from "@/store";
import type { Conversation } from "@/types";

/** A quiet list of recent AI conversations; selecting one re-opens it in Chat. */
export function RecentChats({ conversations }: { conversations: Conversation[] }) {
  const router = useRouter();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const open = (id: string) => {
    setActiveConversation(id);
    router.push("/chat");
  };

  return (
    <ul className="divide-y divide-white/[0.05] overflow-hidden rounded-2xl bg-card/50 ring-1 ring-white/[0.06]">
      {conversations.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => open(c.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-card"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground ring-1 ring-white/5">
              <MessageSquare className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{c.title}</span>
              {c.lastMessagePreview && (
                <span className="block truncate text-xs text-muted-foreground">
                  {c.lastMessagePreview}
                </span>
              )}
            </span>
            <time
              dateTime={c.updatedAt}
              className="shrink-0 text-xs text-muted-foreground/60"
            >
              {formatRelativeDate(c.updatedAt)}
            </time>
          </button>
        </li>
      ))}
    </ul>
  );
}
