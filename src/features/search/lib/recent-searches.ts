const STORAGE_KEY = "recall.recentSearches";
const MAX = 6;

/** Stable empty reference for the SSR snapshot (never mutated). */
const EMPTY: string[] = [];

/** Cached snapshot so `getSnapshot` returns a stable reference between renders. */
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function commit(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recent searches just won't persist */
  }
  listeners.forEach((l) => l());
}

/** Subscribe to recent-search changes (for `useSyncExternalStore`). */
export function subscribeRecentSearches(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Current recent searches — lazily hydrated from storage, cached thereafter. */
export function getRecentSearches(): string[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

/** SSR snapshot — always empty so server and client first paint agree. */
export function getRecentSearchesServer(): string[] {
  return EMPTY;
}

/** Persist `query` to the front of the recent list (de-duped, capped). */
export function pushRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const current = getRecentSearches();
  commit(
    [
      trimmed,
      ...current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX),
  );
}

/** Clear all persisted recent searches. */
export function clearRecentSearches(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  cache = [];
  listeners.forEach((l) => l());
}
