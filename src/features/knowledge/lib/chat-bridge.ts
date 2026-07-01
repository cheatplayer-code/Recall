import type { Citation, KnowledgeItem } from "@/types";

import { deriveRag } from "./rag";

/**
 * Knowledge ↔ AI Chat integration. A memory already carries everything a chat
 * citation needs, so this maps one to the other without coupling the features:
 * Chat renders `Citation`, Knowledge produces it.
 */
export function toCitation(item: KnowledgeItem): Citation {
  const rag = deriveRag(item);
  return {
    id: `cit_${item.id}`,
    documentId: rag.documentId,
    documentName: item.title,
    page: rag.pageCount ? 1 : undefined,
    excerpt: item.ai?.summary ?? item.excerpt,
  };
}

/**
 * Deep link into AI Chat, scoped to a memory. Chat's `ChatHandoff` resolves the
 * id, attaches the memory as context and seeds the prompt — so Knowledge stays
 * decoupled from Chat, passing only a URL.
 */
export function askHref(item: KnowledgeItem): string {
  return `/chat?memory=${encodeURIComponent(item.id)}`;
}
