import type { User } from "./user";

/** Credentials for email/password sign-in. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Payload for creating a new account. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** Normalized (camelCase) token pair used inside the app. */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}

/**
 * Raw token response from the FastAPI backend (snake_case). Mapped to
 * {@link AuthTokens} in the auth service — the only place that knows this shape.
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

/** Lifecycle of the current session. */
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export type { User };
