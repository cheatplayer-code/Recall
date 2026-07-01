"use client";

import { BookOpen, Layers, Quote } from "lucide-react";

import type { Citation, DocumentReference, RetrievedChunk } from "@/types";

import { Disclosure } from "./disclosure";
import { CitationChip } from "./citation-chip";

/**
 * The RAG provenance for one assistant turn: Sources (citations), Retrieved
 * Chunks (raw passages) and Document References. Every section is present in
 * the contract even when empty, so connecting the backend only fills data — the
 * UI structure never changes.
 */
export function RagPanel({
  citations,
  chunks,
  references,
  onOpenCitation,
}: {
  citations?: Citation[];
  chunks?: RetrievedChunk[];
  references?: DocumentReference[];
  onOpenCitation?: (citation: Citation) => void;
}) {
  const citationList = citations ?? [];
  const chunkList = chunks ?? [];
  const referenceList = references ?? [];

  if (
    citationList.length === 0 &&
    chunkList.length === 0 &&
    referenceList.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {citationList.length > 0 && (
        <Disclosure
          icon={BookOpen}
          label="Sources"
          count={citationList.length}
          defaultOpen
        >
          <div className="flex flex-wrap gap-1.5">
            {citationList.map((citation, idx) => (
              <CitationChip
                key={citation.id}
                citation={citation}
                index={idx + 1}
                onOpen={onOpenCitation}
              />
            ))}
          </div>
        </Disclosure>
      )}

      {chunkList.length > 0 && (
        <Disclosure icon={Quote} label="Retrieved Chunks" count={chunkList.length}>
          <ul className="space-y-2">
            {chunkList.map((chunk) => (
              <li
                key={chunk.id}
                className="rounded-md border border-white/[0.06] bg-black/20 p-2.5"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground/55">
                    {chunk.documentName}
                  </span>
                  {chunk.score !== undefined && (
                    <span className="shrink-0 text-[0.7rem] text-muted-foreground/50">
                      {Math.round(chunk.score * 100)}% match
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-foreground/75">
                  {chunk.content}
                </p>
              </li>
            ))}
          </ul>
        </Disclosure>
      )}

      {referenceList.length > 0 && (
        <Disclosure
          icon={Layers}
          label="Document References"
          count={referenceList.length}
        >
          <div className="flex flex-wrap gap-1.5">
            {referenceList.map((ref) => (
              <span
                key={ref.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground/80"
              >
                {ref.name}
                {ref.type && (
                  <span className="text-muted-foreground/50">{ref.type}</span>
                )}
              </span>
            ))}
          </div>
        </Disclosure>
      )}
    </div>
  );
}
