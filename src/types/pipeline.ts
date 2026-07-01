import type { ISODateString } from "./common";

/**
 * Granular lifecycle of a Knowledge item as it moves through the RAG ingestion
 * pipeline. Mirrors what the FastAPI backend job reports/streams:
 *
 *   uploading → processing → extracting → chunking → embedding → indexing → ready
 *
 * `failed` is terminal and can be reached from any stage.
 */
export type PipelineStage =
  | "uploading"
  | "processing"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexing"
  | "ready"
  | "failed";

/** Status of an individual stage within the pipeline history. */
export type StageStatus = "pending" | "active" | "done" | "failed";

export interface PipelineStageState {
  stage: PipelineStage;
  status: StageStatus;
  /** When this stage became active/finished (set by backend or mock). */
  at?: ISODateString;
}

/**
 * Full processing state attached to every Knowledge item. The backend will send
 * this exact shape over REST and push incremental updates via WebSocket; the UI
 * only ever reads it, so no UI changes are needed when the backend goes live.
 */
export interface KnowledgePipeline {
  /** The stage the item is currently in. */
  stage: PipelineStage;
  /** Overall completion, 0..1, derived from the stage sequence. */
  progress: number;
  /** Per-stage history, in pipeline order, for a detailed progress view. */
  stages: PipelineStageState[];
  /** Human-readable error, present only when `stage === "failed"`. */
  error?: string;
  startedAt: ISODateString;
  updatedAt: ISODateString;
}
