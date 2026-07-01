"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "@/store";

import { useChat } from "../hooks/use-chat";
import { useConversations } from "../hooks/use-conversations";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { AttachedContextBar } from "./attached-context-bar";

function ThreadSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-1/2 rounded-2xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="size-7 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * The AI Chat experience: conversation rail + thread + composer. Server state
 * (the conversation list) comes from React Query; the live thread comes from
 * the chat store via `useChat`. This component only composes — every behavior
 * lives in hooks below it.
 */
export function ChatScreen() {
  const { data: conversations = [], isLoading } = useConversations();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const {
    messages,
    isStreaming,
    isLoadingHistory,
    activeConversationId,
    send,
    stop,
    regenerate,
  } = useChat();

  const showEmpty =
    !activeConversationId || (messages.length === 0 && !isLoadingHistory);

  return (
    <div className="flex h-full min-h-0">
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        isLoading={isLoading}
        onSelect={setActiveConversation}
        onNew={() => setActiveConversation(null)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {showEmpty ? (
          <div className="min-h-0 flex-1">
            <ChatEmptyState onPrompt={send} />
          </div>
        ) : isLoadingHistory ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ThreadSkeleton />
          </div>
        ) : (
          <MessageThread messages={messages} onRegenerate={regenerate} />
        )}

        <AttachedContextBar />
        <ChatComposer
          onSend={send}
          onStop={stop}
          isStreaming={isStreaming}
          disabled={isLoadingHistory}
        />
      </div>
    </div>
  );
}
