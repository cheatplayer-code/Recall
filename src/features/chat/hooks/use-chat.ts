"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import {
  streamChatResponse,
  type ChatStreamGrounding,
} from "@/lib/api/chat-stream-channel";
import { chatService } from "@/services";
import { useChatStore, useConversationContextStore } from "@/store";
import type { ChatMessage, Conversation, ID } from "@/types";

import { useCreateConversation } from "./use-conversations";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
}

/**
 * Orchestrates a single conversation: loads its history into the live store,
 * and exposes `send` / `stop` / `regenerate`. All streaming mechanics are
 * delegated to the stream channel — this hook only wires its handlers to the
 * store and keeps the conversation-list cache in sync. No transport or provider
 * knowledge leaks in here.
 */
export function useChat() {
  const queryClient = useQueryClient();
  const { mutateAsync: createConversation } = useCreateConversation();

  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const setMessages = useChatStore((s) => s.setMessages);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const appendToken = useChatStore((s) => s.appendToken);
  const patchMessage = useChatStore((s) => s.patchMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);

  const abortRef = useRef<(() => void) | null>(null);
  // Conversation id whose history has already been pushed into the store, so a
  // background refetch never clobbers an in-flight stream.
  const syncedRef = useRef<ID | null>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: activeConversationId
      ? queryKeys.chat.messages(activeConversationId)
      : ["chat", "messages", "none"],
    queryFn: () => chatService.getMessages(activeConversationId as ID),
    enabled: Boolean(activeConversationId),
  });

  useEffect(() => {
    if (
      activeConversationId &&
      history &&
      syncedRef.current !== activeConversationId
    ) {
      setMessages(history);
      syncedRef.current = activeConversationId;
    }
  }, [activeConversationId, history, setMessages]);

  /** Patch the cached conversation list with the latest preview + title. */
  const touchConversation = useCallback(
    (id: ID, preview: string, title?: string) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.chat.conversations(),
        (old) =>
          old?.map((c) =>
            c.id === id
              ? {
                  ...c,
                  lastMessagePreview: preview.slice(0, 120),
                  title: title ?? c.title,
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
      );
    },
    [queryClient],
  );

  /** Run one assistant turn against `conversationId` for `prompt`. */
  const runAssistantTurn = useCallback(
    (conversationId: ID, prompt: string) => {
      const assistant: ChatMessage = {
        id: uid("msg"),
        conversationId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      appendMessage(assistant);
      setStreaming(true, assistant.id);

      // Carry the conversation's attached-memory context into the request so
      // the backend can scope retrieval. The mock ignores it; nothing else does.
      const ctx = useConversationContextStore.getState();
      abortRef.current = streamChatResponse(
        {
          conversationId,
          message: prompt,
          attachedMemoryIds: ctx.attachedMemories.map((m) => m.memoryId),
          workspaceId: ctx.workspaceId ?? undefined,
        },
        {
          onMetadata: ({ chunks, references }) =>
            patchMessage(assistant.id, { chunks, references, status: "streaming" }),
          onToken: (token) => appendToken(assistant.id, token),
          onDone: (grounding: ChatStreamGrounding) => {
            patchMessage(assistant.id, {
              status: "complete",
              citations: grounding.citations,
              chunks: grounding.chunks,
              references: grounding.references,
            });
            setStreaming(false, null);
            abortRef.current = null;
            const finalized = useChatStore
              .getState()
              .messages.find((m) => m.id === assistant.id);
            if (finalized) {
              chatService.persistMessage(finalized);
              touchConversation(conversationId, finalized.content);
            }
          },
          onError: (error) => {
            patchMessage(assistant.id, {
              status: "error",
              error:
                error instanceof Error ? error.message : "Something went wrong.",
            });
            setStreaming(false, null);
            abortRef.current = null;
          },
        },
      );
    },
    [appendMessage, appendToken, patchMessage, setStreaming, touchConversation],
  );

  const send = useCallback(
    async (text: string) => {
      const prompt = text.trim();
      if (!prompt || isStreaming) return;

      // Ensure a conversation exists; title brand-new ones from the first line.
      let conversationId = activeConversationId;
      let isNew = false;
      if (!conversationId) {
        const ctx = useConversationContextStore.getState();
        const created = await createConversation({
          title: prompt.slice(0, 60),
          workspaceId: ctx.workspaceId ?? undefined,
          attachedMemoryIds: ctx.attachedMemories.map((m) => m.memoryId),
        });
        conversationId = created.id;
        isNew = true;
        syncedRef.current = conversationId; // we own the thread now
        setActiveConversation(conversationId);
      }

      const userMessage: ChatMessage = {
        id: uid("msg"),
        conversationId,
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
        status: "complete",
      };
      appendMessage(userMessage);
      chatService.persistMessage(userMessage);
      touchConversation(
        conversationId,
        prompt,
        isNew ? prompt.slice(0, 60) : undefined,
      );

      runAssistantTurn(conversationId, prompt);
    },
    [
      activeConversationId,
      isStreaming,
      createConversation,
      setActiveConversation,
      appendMessage,
      touchConversation,
      runAssistantTurn,
    ],
  );

  const stop = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    const { streamingMessageId } = useChatStore.getState();
    if (streamingMessageId) {
      patchMessage(streamingMessageId, { status: "complete" });
    }
    setStreaming(false, null);
  }, [patchMessage, setStreaming]);

  const regenerate = useCallback(() => {
    if (isStreaming || !activeConversationId) return;
    const current = useChatStore.getState().messages;
    const lastAssistant = [...current]
      .reverse()
      .find((m) => m.role === "assistant");
    const lastUser = [...current].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    if (lastAssistant) removeMessage(lastAssistant.id);
    runAssistantTurn(activeConversationId, lastUser.content);
  }, [isStreaming, activeConversationId, removeMessage, runAssistantTurn]);

  // Abort any in-flight stream if the hook unmounts.
  useEffect(() => () => abortRef.current?.(), []);

  return {
    messages,
    isStreaming,
    isLoadingHistory: Boolean(activeConversationId) && isLoading,
    activeConversationId,
    send,
    stop,
    regenerate,
  };
}
