import { http, HttpError } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import { authStorage } from "@/lib/api/auth-storage";
import {
  mapConversation,
  mapMessage,
  type ConversationDTO,
  type MessageDTO,
} from "@/lib/api/mappers";
import type {
  ChatStreamEvent,
  ChatStreamGrounding,
  ChatStreamHandlers,
  ChatStreamRequestBody,
} from "@/lib/api/contracts";
import type { ChatMessage, Conversation, ID } from "@/types";

/**
 * Chat data access — talks to the real backend.
 *
 * Conversations and message history are ordinary request/response. Generating
 * an answer is the only streamed operation: `streamAnswer` POSTs to
 * `/chat/stream` and parses the SSE frame protocol (`retrieval` → `token`* →
 * `citations` → `done`), surfacing grounding and tokens to the UI. The backend
 * owns retrieval and generation — the frontend never fabricates either.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000/api/v1" : "");

export const chatService = {
  listConversations: async (): Promise<Conversation[]> => {
    const dtos = await http.get<ConversationDTO[]>(endpoints.chat.conversations);
    return dtos.map(mapConversation);
  },

  getConversation: async (id: ID): Promise<Conversation | null> => {
    try {
      const dto = await http.get<ConversationDTO>(endpoints.chat.conversation(id));
      return mapConversation(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },

  createConversation: async (
    options: { title?: string; workspaceId?: ID; attachedMemoryIds?: ID[] } = {},
  ): Promise<Conversation> => {
    const dto = await http.post<ConversationDTO>(endpoints.chat.conversations, {
      title: options.title,
      workspaceId: options.workspaceId,
      attachedMemoryIds: options.attachedMemoryIds ?? [],
    });
    return mapConversation(dto);
  },

  /**
   * Attaching/detaching memories after creation has no backend mutation yet —
   * attached context is set when the conversation is created. The live UI is
   * driven by the conversation-context store; these are no-ops server-side.
   */
  attachMemory: async (
    _conversationId: ID,
    _memoryId: ID,
  ): Promise<Conversation | null> => {
    void _conversationId;
    void _memoryId;
    return null;
  },
  detachMemory: async (
    _conversationId: ID,
    _memoryId: ID,
  ): Promise<Conversation | null> => {
    void _conversationId;
    void _memoryId;
    return null;
  },

  getMessages: async (conversationId: ID): Promise<ChatMessage[]> => {
    const dtos = await http.get<MessageDTO[]>(endpoints.chat.messages(conversationId));
    return dtos.map(mapMessage);
  },

  /**
   * The backend persists messages during streaming once the ML service is
   * connected; until then history lives in the chat store for the session. This
   * stays a client-side concern, so the hook contract is unchanged.
   */
  persistMessage: (_message: ChatMessage): void => {
    void _message;
  },

  /**
   * Stream an assistant turn from `POST /chat/stream`. Parses the SSE frames and
   * drives the handlers; returns an abort function ("stop generation").
   */
  streamAnswer: (
    request: ChatStreamRequestBody,
    handlers: ChatStreamHandlers,
  ): (() => void) => {
    const controller = new AbortController();

    void (async () => {
      let chunks: ChatStreamGrounding["chunks"] = [];
      let references: ChatStreamGrounding["references"] = [];
      let citations: ChatStreamGrounding["citations"] = [];
      let settled = false;

      try {
        const token = authStorage.getAccessToken();
        const res = await fetch(`${BASE_URL}${endpoints.chat.stream}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            conversationId: request.conversationId,
            message: request.message,
            attachedMemoryIds: request.attachedMemoryIds ?? [],
            workspaceId: request.workspaceId,
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`Chat stream failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let boundary: number;
          while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 2);
            const data = frame.startsWith("data:") ? frame.slice(5).trim() : frame;
            if (!data || data === "[DONE]") continue;

            const event = JSON.parse(data) as ChatStreamEvent;
            if (event.type === "retrieval") {
              chunks = event.chunks;
              references = event.references;
              handlers.onMetadata?.({ chunks, references });
            } else if (event.type === "token") {
              handlers.onToken(event.value);
            } else if (event.type === "citations") {
              citations = event.citations;
            } else if (event.type === "done") {
              settled = true;
              handlers.onDone({ citations, chunks, references });
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        }

        if (!settled) handlers.onDone({ citations, chunks, references });
      } catch (error) {
        if (controller.signal.aborted) return; // user pressed stop
        handlers.onError(error);
      }
    })();

    return () => controller.abort();
  },
};
