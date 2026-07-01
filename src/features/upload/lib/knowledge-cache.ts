import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import type { ID, KnowledgeItem } from "@/types";

const LIST_PREFIX = [...queryKeys.knowledge.all, "list"];
const RECENT_PREFIX = [...queryKeys.knowledge.all, "recent"];

type ListData = KnowledgeItem[] | undefined;

/** Apply `fn` to every cached knowledge list/recent array. */
function mapListCaches(
  qc: QueryClient,
  fn: (items: KnowledgeItem[]) => KnowledgeItem[],
) {
  for (const prefix of [LIST_PREFIX, RECENT_PREFIX]) {
    qc.setQueriesData<ListData>({ queryKey: prefix }, (old) =>
      old ? fn(old) : old,
    );
  }
}

/** Optimistically prepend a new item to all list caches. */
export function insertKnowledgeItem(qc: QueryClient, item: KnowledgeItem) {
  mapListCaches(qc, (items) => [item, ...items]);
}

/** Replace an item (matched by id) wherever it appears, incl. the detail cache. */
export function replaceKnowledgeItem(
  qc: QueryClient,
  matchId: ID,
  next: KnowledgeItem,
) {
  mapListCaches(qc, (items) =>
    items.map((i) => (i.id === matchId ? next : i)),
  );
  qc.setQueryData(queryKeys.knowledge.detail(matchId), null);
  qc.setQueryData(queryKeys.knowledge.detail(next.id), next);
}

/** Remove an item by id from all list caches (used to roll back on error). */
export function removeKnowledgeItem(qc: QueryClient, id: ID) {
  mapListCaches(qc, (items) => items.filter((i) => i.id !== id));
}

/** Patch a single item in place across list and detail caches. */
export function patchKnowledgeItem(
  qc: QueryClient,
  id: ID,
  patch: Partial<KnowledgeItem>,
) {
  mapListCaches(qc, (items) =>
    items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  );
  qc.setQueryData<KnowledgeItem | null>(
    queryKeys.knowledge.detail(id),
    (old) => (old ? { ...old, ...patch } : old),
  );
}
