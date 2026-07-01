"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { errorMessage } from "@/lib/api/error-message";
import { toast } from "@/store";
import { type CreateKnowledgeInput } from "@/services";

import { ingestInput } from "../lib/ingest";

/**
 * Creates a knowledge item from the Capture dialog. Capture is just another
 * input source for the ONE shared ingestion pipeline — it builds a
 * `CreateKnowledgeInput` (see `buildCreateInput`) and hands it to `ingestInput`,
 * exactly like drag-and-drop Upload. On failure the optimistic card is rolled
 * back (inside `ingestInput`) and a toast with Retry is shown.
 */
export function useCreateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKnowledgeInput) => ingestInput(queryClient, input),
    onError: (error, input) => {
      toast.error(errorMessage(error), {
        label: "Retry",
        onClick: () => void ingestInput(queryClient, input).catch(() => {}),
      });
    },
  });
}
