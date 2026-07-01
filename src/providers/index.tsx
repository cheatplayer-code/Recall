"use client";

import { useEffect, type ReactNode } from "react";

import { authStorage } from "@/lib/api/auth-storage";
import { setUnauthorizedHandler } from "@/lib/api/http";
import { authService } from "@/services";
import { useAuthStore } from "@/store";
import { Toaster } from "@/components/common";

import { QueryProvider } from "./query-provider";

/**
 * Resolves the session on load and wires the global 401 handler. There is NO
 * auto-login: if a token is already stored we validate it by loading the user;
 * otherwise we mark the session unauthenticated and the route guard sends the
 * visitor to the login screen. On an unrecoverable 401 the session is cleared.
 */
function AuthBootstrap() {
  useEffect(() => {
    const { setUser, setStatus, clearSession } = useAuthStore.getState();

    setUnauthorizedHandler(() => clearSession());

    if (authStorage.hasSession()) {
      setStatus("loading");
      authService
        .me()
        .then(setUser)
        .catch(() => clearSession());
    } else {
      setStatus("unauthenticated");
    }

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  return null;
}

/**
 * Single composition point for all client-side providers. Add future providers
 * (theme, tooltip, toaster, analytics) here so the root layout stays clean.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthBootstrap />
      {children}
      <Toaster />
    </QueryProvider>
  );
}
