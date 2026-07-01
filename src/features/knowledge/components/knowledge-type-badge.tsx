import type { KnowledgeType } from "@/types";

import { KNOWLEDGE_TYPE_META } from "../constants";

/** A quiet glass chip naming the memory's source type. */
export function KnowledgeTypeBadge({ type }: { type: KnowledgeType }) {
  const meta = KNOWLEDGE_TYPE_META[type];
  const Icon = meta.icon;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/55 px-2 py-0.5 text-xs font-medium text-foreground/80 ring-1 ring-white/10 backdrop-blur">
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
