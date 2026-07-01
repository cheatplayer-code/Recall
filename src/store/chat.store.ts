import { create } from "zustand";

import type { ChatMessage, ID, MessageGrounding, MessageStatus } from "@/types";

/**
 * Live thread state for the active conversation. Streaming tokens arrive many
 * times per second, so the in-flight thread lives here (cheap immutable array
 * updates) rather than in the React Query cache. The conversation *list* and
 * persisted history stay in React Query; this store is the working buffer the
 * thread renders from.
 *
 * `appendToken` changes the object identity of only the streaming message, so
 * memoized bubbles for every other message skip re-render — the path that keeps
 * long threads cheap.
 */
interface ChatState {
  activeConversationId: ID | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  /** Id of the assistant message currently streaming (for stop/regenerate). */
  streamingMessageId: ID | null;

  setActiveConversation: (id: ID | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  appendToken: (id: ID, token: string) => void;
  patchMessage: (id: ID, patch: Partial<ChatMessage> & MessageGrounding) => void;
  removeMessage: (id: ID) => void;
  setStreaming: (isStreaming: boolean, messageId?: ID | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessageId: null,

  setActiveConversation: (id) =>
    set({ activeConversationId: id, messages: [], streamingMessageId: null }),

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  appendToken: (id, token) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id
          ? { ...m, content: m.content + token, status: "streaming" as MessageStatus }
          : m,
      ),
    })),

  patchMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  setStreaming: (isStreaming, messageId) =>
    set((s) => ({
      isStreaming,
      streamingMessageId:
        messageId === undefined ? s.streamingMessageId : messageId,
    })),

  reset: () =>
    set({ messages: [], isStreaming: false, streamingMessageId: null }),
}));
