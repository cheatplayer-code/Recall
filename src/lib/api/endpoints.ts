/**
 * Centralized API endpoint registry — the single source of truth for backend
 * paths. Services MUST import from here; never hardcode endpoint strings.
 *
 * Paths are relative to `NEXT_PUBLIC_API_URL` (which includes the `/api/v1`
 * prefix). Functions are used where a path has parameters. These mirror the
 * live FastAPI router exactly.
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },

  users: {
    me: "/users/me",
  },

  workspaces: {
    list: "/workspaces",
    create: "/workspaces",
    detail: (id: string) => `/workspaces/${id}`,
  },

  collections: {
    list: "/collections",
    create: "/collections",
    detail: (id: string) => `/collections/${id}`,
  },

  knowledge: {
    list: "/knowledge",
    create: "/knowledge",
    detail: (id: string) => `/knowledge/${id}`,
  },

  /** Document ingestion + RAG processing pipeline. */
  documents: {
    upload: "/documents",
    url: "/documents/url",
    status: (id: string) => `/documents/${id}/status`,
    detail: (id: string) => `/documents/${id}`,
  },

  /** Upload job tracking (worker queue + SSE). */
  uploads: {
    jobs: "/uploads/jobs",
    job: (id: string) => `/uploads/jobs/${id}`,
    stream: (id: string) => `/uploads/jobs/${id}/stream`,
  },

  /** RAG chat: streamed answers with retrieval + citations. */
  chat: {
    conversations: "/chat/conversations",
    conversation: (id: string) => `/chat/conversations/${id}`,
    messages: (conversationId: string) =>
      `/chat/conversations/${conversationId}/messages`,
    /** Streaming answer endpoint (SSE / chunked). */
    stream: "/chat/stream",
  },

  /** Search + semantic retrieval. */
  search: {
    query: "/search",
    retrieve: "/search",
    similar: "/search/similar",
    related: "/search/related",
    history: "/search/history",
    chunk: (id: string) => `/search/chunks/${id}`,
    debug: "/search/debug",
  },
} as const;
