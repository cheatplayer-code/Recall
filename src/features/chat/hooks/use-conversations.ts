"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { chatService } from "@/services";
import type { Conversation, ID } from "@/types";

export interface CreateConversationOptions {
  title?: string;
  workspaceId?: ID;
  attachedMemoryIds?: ID[];
}

/** The conversation list — server state, fetched and cached via React Query. */
export function useConversations() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: () => chatService.listConversations(),
  });
}

/** Creates a conversation and prepends it to the cached list. */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: CreateConversationOptions = {}) =>
      chatService.createConversation(options),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(
        queryKeys.chat.conversations(),
        (old) => (old ? [conversation, ...old] : [conversation]),
      );
    },
  });
}
