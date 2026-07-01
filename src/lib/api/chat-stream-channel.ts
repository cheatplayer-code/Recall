import { chatService } from "@/services";
import type {
  ChatStreamGrounding,
  ChatStreamHandlers,
  ChatStreamRequestBody,
} from "@/lib/api/contracts";

/**
 * The stable, UI-facing streaming interface. It exists so React components never
 * change when the backend does: the UI calls `streamChatResponse` and consumes
 * the handlers, while the real work lives below it —
 *
 *   streamChatResponse → chatService.streamAnswer (retrieval-first)
 *                      → aiService.generate (mock today / FastAPI tomorrow)
 *
 * Returns an `abort` function — calling it is "Stop generation".
 */

export type ChatStreamRequest = ChatStreamRequestBody;
export type { ChatStreamGrounding, ChatStreamHandlers };

export function streamChatResponse(
  request: ChatStreamRequest,
  handlers: ChatStreamHandlers,
): () => void {
  return chatService.streamAnswer(request, handlers);
}
