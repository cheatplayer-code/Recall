/**
 * Centralized React Query cache keys.
 *
 * One source of truth for every query key in the app. Using factory functions
 * keeps keys consistent for fetching and invalidation (e.g. after a mutation
 * you call `queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all })`).
 */
export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    list: () => [...queryKeys.workspaces.all, "list"] as const,
    detail: (id: string) => [...queryKeys.workspaces.all, "detail", id] as const,
  },
  collections: {
    all: ["collections"] as const,
    list: (workspaceId?: string) =>
      [...queryKeys.collections.all, "list", workspaceId ?? "all"] as const,
    detail: (id: string) => [...queryKeys.collections.all, "detail", id] as const,
  },
  knowledge: {
    all: ["knowledge"] as const,
    list: (params?: object) =>
      [...queryKeys.knowledge.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.knowledge.all, "detail", id] as const,
    recent: () => [...queryKeys.knowledge.all, "recent"] as const,
    related: (id: string) => [...queryKeys.knowledge.all, "related", id] as const,
  },
  search: {
    all: ["search"] as const,
    query: (q: string) => [...queryKeys.search.all, q] as const,
  },
  chat: {
    all: ["chat"] as const,
    conversations: () => [...queryKeys.chat.all, "conversations"] as const,
    messages: (conversationId: string) =>
      [...queryKeys.chat.all, "messages", conversationId] as const,
  },
} as const;
