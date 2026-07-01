import type { AuthTokens } from "@/types";

/**
 * Session token persistence. Uses localStorage for the MVP (simplest, works
 * with the FastAPI Bearer flow). SSR-safe: every access is guarded so it can be
 * imported anywhere without breaking server rendering.
 *
 * Security note: localStorage is readable by injected scripts (XSS). For the
 * MVP this is an accepted trade-off; the upgrade path is httpOnly refresh
 * cookies once the backend supports them — and only this file would change.
 */
const ACCESS_KEY = "recall.accessToken";
const REFRESH_KEY = "recall.refreshToken";

const isBrowser = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefreshToken(): string | null {
    return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  set(tokens: AuthTokens): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
  hasSession(): boolean {
    return Boolean(this.getAccessToken());
  },
};
