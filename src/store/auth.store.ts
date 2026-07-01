import { create } from "zustand";

import { authStorage } from "@/lib/api/auth-storage";
import type { AuthStatus, User } from "@/types";

/**
 * Current session state. This holds the authenticated user and lifecycle
 * status; tokens live in {@link authStorage}, server data lives in React Query.
 * UI reads `status`/`user`; mutations are driven from the `useAuth` hook.
 */
interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  /** Clear tokens and reset to unauthenticated (logout / 401). */
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status }),
  clearSession: () => {
    authStorage.clear();
    set({ user: null, status: "unauthenticated" });
  },
}));
