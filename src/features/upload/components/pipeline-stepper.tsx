import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import { PIPELINE_STAGE_META, PIPELINE_STAGE_SEQUENCE } from "@/lib/pipeline";
import type { KnowledgePipeline, PipelineStage, StageStatus } from "@/types";

function stageStatus(
  pipeline: KnowledgePipeline,
  stage: PipelineStage,
): StageStatus {
  return pipeline.stages.find((s) => s.stage === stage)?.status ?? "pending";
}

/**
 * Presentational view of a RAG pipeline: a progress bar plus every stage with
 * its icon, label, active description and timestamp. Designed for streamed
 * updates — it simply re-renders from whatever `pipeline` it's given.
 */
export function PipelineStepper({ pipeline }: { pipeline: KnowledgePipeline }) {
  const failed = pipeline.stage === "failed";

  return (
    <div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full transition-[width] duration-700",
            failed ? "bg-destructive" : "bg-aurora",
          )}
          style={{ width: `${Math.round(pipeline.progress * 100)}%` }}
        />
      </div>

      <ol className="mt-4 space-y-2.5">
        {PIPELINE_STAGE_SEQUENCE.map((stage) => {
          const meta = PIPELINE_STAGE_META[stage];
          const status = stageStatus(pipeline, stage);
          const at = pipeline.stages.find((s) => s.stage === stage)?.at;
          const Icon = meta.icon;

          return (
            <li
              key={stage}
              className={cn(
                "flex items-center gap-3",
                status === "pending" && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full ring-1 ring-white/10",
                  status === "done" && "text-success",
                  status === "active" && "text-foreground",
                  status === "failed" && "text-destructive",
                  status === "pending" && "text-muted-foreground",
                )}
              >
                {status === "active" ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="size-3.5" aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    status === "active" && "font-medium",
                  )}
                >
                  {meta.label}
                </p>
                {status === "active" && (
                  <p className="text-xs text-muted-foreground">
                    {meta.description}
                  </p>
                )}
              </div>

              {at && (
                <time className="shrink-0 text-[0.7rem] text-muted-foreground/50">
                  {formatTime(at)}
                </time>
              )}
            </li>
          );
        })}
      </ol>

      {failed && pipeline.error && (
        <p className="mt-3 text-xs text-destructive">{pipeline.error}</p>
      )}
    </div>
  );
}
