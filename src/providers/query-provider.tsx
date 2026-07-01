"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/lib/api/query-client";

/**
 * Wraps the app in a React Query client. The client is created once per browser
 * session via `useState` so it survives re-renders but is never shared across
 * requests on the server.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
