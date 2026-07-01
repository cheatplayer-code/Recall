"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { errorMessage } from "@/lib/api/error-message";
import { useUploadStore, toast } from "@/store";

import { buildInputFromFile } from "../lib/build-input";
import { ingestInput } from "../lib/ingest";

/**
 * Drives the drag-and-drop Upload flow. Each file is turned into an ingestion
 * payload and handed to the ONE shared pipeline (`ingestInput`); the observers
 * mirror lifecycle into the Upload screen's store. A failed upload rolls back
 * its optimistic card (inside `ingestInput`) and raises a toast with Retry.
 */
export function useUpload() {
  const queryClient = useQueryClient();
  const addUpload = useUploadStore((s) => s.add);
  const replaceUploadId = useUploadStore((s) => s.replaceId);
  const patchUploadPipeline = useUploadStore((s) => s.patchPipeline);

  const runIngest = useCallback(
    (file: File) =>
      ingestInput(queryClient, buildInputFromFile(file), {
        onOptimistic: (item) => addUpload(item),
        onCreated: (tempId, item) => replaceUploadId(tempId, item),
        onPipeline: (id, pipeline) => patchUploadPipeline(id, pipeline),
      }),
    [queryClient, addUpload, replaceUploadId, patchUploadPipeline],
  );

  const uploadOne = useCallback(
    (file: File) => {
      runIngest(file).catch((error: unknown) => {
        toast.error(errorMessage(error), {
          label: "Retry",
          onClick: () => void runIngest(file).catch(() => {}),
        });
      });
    },
    [runIngest],
  );

  const upload = useCallback(
    (files: File[]) => {
      files.forEach((file) => uploadOne(file));
    },
    [uploadOne],
  );

  return { upload };
}
