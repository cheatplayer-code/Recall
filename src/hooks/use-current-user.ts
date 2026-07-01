"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { userService } from "@/services";

/** The signed-in user's profile — server state via React Query. */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => userService.getMe(),
    staleTime: 5 * 60 * 1000,
  });
}
