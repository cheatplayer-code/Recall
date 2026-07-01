"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authStorage } from "@/lib/api/auth-storage";
import { authService } from "@/services";
import { useAuthStore } from "@/store";
import type { LoginCredentials, RegisterPayload, User } from "@/types";

/**
 * The single entry point the UI uses for authentication. Wraps the auth service
 * in React Query mutations and syncs the result into the auth store. Keeps all
 * auth business logic out of components.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function establishSession(): Promise<User> {
    const me = await authService.me();
    setUser(me);
    return me;
  }

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokens = await authService.login(credentials);
      authStorage.set(tokens);
      return establishSession();
    },
  });

  const register = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const tokens = await authService.register(payload);
      authStorage.set(tokens);
      return establishSession();
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await authService.logout();
      clearSession();
      queryClient.clear();
    },
  });

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    login,
    register,
    logout,
  };
}
