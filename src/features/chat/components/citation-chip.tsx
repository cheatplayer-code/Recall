"use client";

import { FileText, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Citation } from "@/types";

/**
 * The reusable citation primitive: document name, optional page and confidence,
 * and an "open document" affordance. The open action is wired to a no-op for
 * now (the backend will provide a route/target); the contract is already here.
 */
export function CitationChip({
  citation,
  index,
  onOpen,
}: {
  citation: Citation;
  index?: number;
  onOpen?: (citation: Citation) => void;
}) {
  const confidence =
    citation.confidence !== undefined
      ? `${Math.round(citation.confidence * 100)}%`
      : null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(citation)}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs transition-colors",
        "hover:border-white/20 hover:bg-white/[0.07]",
      )}
      title={citation.excerpt ?? citation.documentName}
    >
      {index !== undefined && (
        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-[0.6rem] font-medium text-primary">
          {index}
        </span>
      )}
      <FileText
        className="size-3 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="truncate text-foreground/85">{citation.documentName}</span>
      {citation.page !== undefined && (
        <span className="shrink-0 text-muted-foreground/60">p.{citation.page}</span>
      )}
      {confidence && (
        <span className="shrink-0 text-muted-foreground/50">{confidence}</span>
      )}
      <ExternalLink
        className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/70"
        aria-hidden="true"
      />
    </button>
  );
}
