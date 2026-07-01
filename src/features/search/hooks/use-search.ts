"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { useKnowledgeList } from "@/features/knowledge/hooks/use-knowledge";
import { useConversations } from "@/features/chat/hooks/use-conversations";
import { useActiveWorkspaceId } from "@/hooks/use-active-workspace";
import { byNewest } from "@/lib/knowledge-select";
import type { Conversation, KnowledgeItem } from "@/types";

import { groupMemories, type GroupedMemories } from "../lib/group";
import {
  clearRecentSearches,
  getRecentSearches,
  getRecentSearchesServer,
  pushRecentSearch,
  subscribeRecentSearches,
} from "../lib/recent-searches";

function matchesMemory(item: KnowledgeItem, q: string): boolean {
  return (
    item.title.toLowerCase().includes(q) ||
    (item.excerpt?.toLowerCase().includes(q) ?? false) ||
    (item.content?.toLowerCase().includes(q) ?? false) ||
    item.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function matchesConversation(c: Conversation, q: string): boolean {
  return (
    c.title.toLowerCase().includes(q) ||
    (c.lastMessagePreview?.toLowerCase().includes(q) ?? false)
  );
}

export interface UseSearchResult {
  query: string;
  setQuery: (value: string) => void;
  /** Persist the current query as a recent search (call on submit/result open). */
  commit: () => void;
  recent: string[];
  clearRecent: () => void;
  isLoading: boolean;
  isError: boolean;
  /** True once the user has typed something to search for. */
  hasQuery: boolean;
  groups: GroupedMemories[];
  conversations: Conversation[];
  totalCount: number;
}

/**
 * Instant client-side search across the loaded knowledge store and AI
 * conversations. No vector search yet — filtering is synchronous over already
 * fetched data, so results update as the user types. The grouped shape is the
 * exact contract a future semantic backend will fill, so the UI won't change.
 */
export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState("");
  const recent = useSyncExternalStore(
    subscribeRecentSearches,
    getRecentSearches,
    getRecentSearchesServer,
  );

  const workspaceId = useActiveWorkspaceId();
  const { data: items = [], isLoading, isError } = useKnowledgeList({ workspaceId });
  const { data: conversations = [] } = useConversations();

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const { groups, matchedConversations, totalCount } = useMemo(() => {
    if (!hasQuery) {
      return { groups: [], matchedConversations: [], totalCount: 0 };
    }
    const memories = byNewest(items.filter((i) => matchesMemory(i, q)));
    const convos = conversations.filter((c) => matchesConversation(c, q));
    return {
      groups: groupMemories(memories),
      matchedConversations: convos,
      totalCount: memories.length + convos.length,
    };
  }, [items, conversations, q, hasQuery]);

  const commit = useCallback(() => {
    pushRecentSearch(query);
  }, [query]);

  const clearRecent = useCallback(() => clearRecentSearches(), []);

  return {
    query,
    setQuery,
    commit,
    recent,
    clearRecent,
    isLoading,
    isError,
    hasQuery,
    groups,
    conversations: matchedConversations,
    totalCount,
  };
}
