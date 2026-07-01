"use client";

import { Plus, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation, ID } from "@/types";

/**
 * The conversation rail: new chat, then the list with the active one
 * highlighted. Server state arrives via React Query; this component is purely
 * presentational and emits selection / creation intents.
 */
export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onNew,
}: {
  conversations: Conversation[];
  activeId: ID | null;
  isLoading: boolean;
  onSelect: (id: ID) => void;
  onNew: () => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 md:flex">
      <div className="p-3">
        <Button
          variant="outline"
          onClick={onNew}
          className="w-full justify-start gap-2"
        >
          <Plus className="size-4" aria-hidden="true" /> New chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {isLoading ? (
          <div className="space-y-1.5 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <MessageSquare
                      className="mt-0.5 size-3.5 shrink-0 opacity-60"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {conversation.title}
                      </span>
                      {conversation.lastMessagePreview && (
                        <span className="block truncate text-xs text-muted-foreground/60">
                          {conversation.lastMessagePreview}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
