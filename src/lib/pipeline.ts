import {
  Upload,
  Cog,
  ScanText,
  Scissors,
  Boxes,
  Layers,
  CheckCircle2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  ISODateString,
  KnowledgePipeline,
  PipelineStage,
  PipelineStageState,
  ProcessingStatus,
} from "@/types";

/**
 * Happy-path order an item moves through the RAG ingestion pipeline. `failed`
 * is intentionally excluded — it's a terminal state reachable from any stage.
 */
export const PIPELINE_STAGE_SEQUENCE: PipelineStage[] = [
  "uploading",
  "processing",
  "extracting",
  "chunking",
  "embedding",
  "indexing",
  "ready",
];

export interface PipelineStageMeta {
  label: string;
  /** Verb shown while the stage is active, e.g. "Extracting…". */
  activeLabel: string;
  /** One-line explanation of what happens in this stage. */
  description: string;
  icon: LucideIcon;
}

export const PIPELINE_STAGE_META: Record<PipelineStage, PipelineStageMeta> = {
  uploading: {
    label: "Uploading",
    activeLabel: "Uploading…",
    description: "Saving your file securely.",
    icon: Upload,
  },
  processing: {
    label: "Processing",
    activeLabel: "Processing…",
    description: "Preparing the document for ingestion.",
    icon: Cog,
  },
  extracting: {
    label: "Extracting",
    activeLabel: "Extracting…",
    description: "Reading text and content from the file.",
    icon: ScanText,
  },
  chunking: {
    label: "Chunking",
    activeLabel: "Chunking…",
    description: "Splitting the content into passages.",
    icon: Scissors,
  },
  embedding: {
    label: "Embedding",
    activeLabel: "Embedding…",
    description: "Turning passages into vectors.",
    icon: Boxes,
  },
  indexing: {
    label: "Indexing",
    activeLabel: "Indexing…",
    description: "Adding it to your searchable memory.",
    icon: Layers,
  },
  ready: {
    label: "Ready",
    activeLabel: "Ready",
    description: "Ready to recall.",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    activeLabel: "Failed",
    description: "Something went wrong during processing.",
    icon: AlertCircle,
  },
};

/** Index of a stage within the happy-path sequence (ready = last). */
function stageIndex(stage: PipelineStage): number {
  const i = PIPELINE_STAGE_SEQUENCE.indexOf(stage);
  return i === -1 ? PIPELINE_STAGE_SEQUENCE.length - 1 : i;
}

/** Overall progress 0..1 for a given stage. */
export function stageProgress(stage: PipelineStage): number {
  if (stage === "failed") return 1;
  const lastIndex = PIPELINE_STAGE_SEQUENCE.length - 1;
  return stageIndex(stage) / lastIndex;
}

/** The next stage after `stage`, or null if already at the end. */
export function nextStage(stage: PipelineStage): PipelineStage | null {
  const i = PIPELINE_STAGE_SEQUENCE.indexOf(stage);
  if (i === -1 || i >= PIPELINE_STAGE_SEQUENCE.length - 1) return null;
  return PIPELINE_STAGE_SEQUENCE[i + 1];
}

/** Coarse status for badges/filters, derived from the detailed pipeline. */
export function getProcessingStatus(pipeline: KnowledgePipeline): ProcessingStatus {
  switch (pipeline.stage) {
    case "ready":
      return "ready";
    case "failed":
      return "failed";
    case "uploading":
      return "uploading";
    default:
      return "processing";
  }
}

/** Build the per-stage history for a current stage (and optional failure). */
function buildStageHistory(
  current: PipelineStage,
  at: ISODateString,
  failed = false,
): PipelineStageState[] {
  const currentIdx = stageIndex(current);
  return PIPELINE_STAGE_SEQUENCE.map((stage, idx): PipelineStageState => {
    if (failed && idx === currentIdx) return { stage, status: "failed", at };
    if (idx < currentIdx) return { stage, status: "done" };
    if (idx === currentIdx) {
      return {
        stage,
        status: stage === "ready" ? "done" : "active",
        at,
      };
    }
    return { stage, status: "pending" };
  });
}

/** A fully-processed pipeline (used by seed data for completed items). */
export function readyPipeline(at: ISODateString): KnowledgePipeline {
  return {
    stage: "ready",
    progress: 1,
    stages: buildStageHistory("ready", at),
    startedAt: at,
    updatedAt: at,
  };
}

/** A pipeline currently paused at `stage` (in-flight processing). */
export function processingPipeline(
  at: ISODateString,
  stage: PipelineStage = "processing",
): KnowledgePipeline {
  return {
    stage,
    progress: stageProgress(stage),
    stages: buildStageHistory(stage, at),
    startedAt: at,
    updatedAt: at,
  };
}

/** A pipeline that failed at `stage`. */
export function failedPipeline(
  at: ISODateString,
  stage: PipelineStage,
  error: string,
): KnowledgePipeline {
  return {
    stage: "failed",
    progress: stageProgress(stage),
    stages: buildStageHistory(stage, at, true),
    error,
    startedAt: at,
    updatedAt: at,
  };
}

/** Fresh pipeline for a just-created item (entry point for uploads). */
export function initialPipeline(at: ISODateString): KnowledgePipeline {
  return processingPipeline(at, "uploading");
}

/** Advance a pipeline to its next stage, returning a new pipeline object. */
export function advancePipeline(
  pipeline: KnowledgePipeline,
  at: ISODateString,
): KnowledgePipeline {
  const next = nextStage(pipeline.stage);
  if (!next) return pipeline;
  return {
    ...pipeline,
    stage: next,
    progress: stageProgress(next),
    stages: buildStageHistory(next, at),
    updatedAt: at,
  };
}
