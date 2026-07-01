import { QueryClient } from "@tanstack/react-query";

/**
 * Factory for the app-wide QueryClient.
 *
 * Defaults are tuned for a knowledge app where data is read-heavy and changes
 * infrequently within a session. When the FastAPI backend is wired up, only the
 * service layer changes — these caching defaults stay valid.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min — avoid refetch storms while navigating
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
