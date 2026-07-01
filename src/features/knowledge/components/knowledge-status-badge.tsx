import { getProcessingStatus } from "@/lib/pipeline";
import type { KnowledgePipeline } from "@/types";

import { STAGE_PHRASE } from "../presentation";

/**
 * The AI made felt, not labelled. While a memory is being understood, a small
 * aurora breathes beside a human phrase ("Listening…", "Understanding…") — no
 * technical pipeline language, no CI/CD feel.
 */
export function KnowledgeStatusBadge({
  pipeline,
}: {
  pipeline: KnowledgePipeline;
}) {
  const status = getProcessingStatus(pipeline);
  const phrase = STAGE_PHRASE[pipeline.stage];

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive ring-1 ring-destructive/25 backdrop-blur">
        {phrase}
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-white/10 backdrop-blur">
        {phrase}
      </span>
    );
  }

  // uploading / processing — a living, breathing presence
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground/80 ring-1 ring-white/10 backdrop-blur">
      <span
        className="bg-aurora animate-breathe size-2 rounded-full"
        aria-hidden="true"
      />
      {phrase}
    </span>
  );
}
