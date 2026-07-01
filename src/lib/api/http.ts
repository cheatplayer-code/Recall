/**
 * HTTP client for the FastAPI backend.
 *
 * The single transport every service uses. Responsibilities that belong to the
 * transport (and nowhere else) live here:
 *   - attaching the Bearer access token,
 *   - JSON vs multipart (FormData) bodies,
 *   - transparent access-token refresh on a 401, then one retry,
 *   - surfacing a typed {@link HttpError} for everything else.
 *
 * Base URL comes from `NEXT_PUBLIC_API_URL` (the API root, including `/api/v1`).
 */

import { authStorage } from "./auth-storage";
import { endpoints } from "./endpoints";
import type { TokenResponse } from "@/types";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
  }
}

// The API root (includes /api/v1). Falls back to the local backend in dev so the
// app works out of the box without an .env.local; production must set it.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000/api/v1" : "");

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Attach the Bearer access token. Default true; set false for auth endpoints. */
  auth?: boolean;
  /** Internal: prevents an infinite refresh→retry loop. */
  _retry?: boolean;
};

/**
 * Global 401 handler (registered once by the app providers). Lets the data layer
 * react to a session that can't be recovered (clear tokens, reset auth store)
 * without the HTTP client importing app state.
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/**
 * Optional session recoverer (registered by the app providers). When a request
 * 401s and a token refresh isn't possible, this is invoked to (re)establish a
 * session — e.g. the dev auto-login — after which the original request is
 * retried once. Lets any request self-heal without a login screen.
 */
let recoverSession: (() => Promise<boolean>) | null = null;
export function setSessionRecoverer(fn: (() => Promise<boolean>) | null): void {
  recoverSession = fn;
}
let recoverInFlight: Promise<boolean> | null = null;

/**
 * A single in-flight refresh shared by all callers, so a burst of 401s triggers
 * exactly one refresh request.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}${endpoints.auth.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const tokens = (await res.json()) as TokenResponse;
    authStorage.set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type,
    });
    return true;
  } catch {
    return false;
  }
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Set it in .env.local to connect " +
        "to the FastAPI backend.",
    );
  }

  const { body, headers, auth = true, _retry = false, ...rest } = options;
  const token = auth ? authStorage.getAccessToken() : null;
  const form = isFormData(body);

  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      // Let the browser set the multipart boundary for FormData.
      ...(form ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined ? undefined : form ? (body as FormData) : JSON.stringify(body),
  });

  // Self-heal on a 401: (1) refresh the access token, else (2) re-establish a
  // session via the registered recoverer — then retry the original request once.
  if (res.status === 401 && auth && !_retry) {
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    let recovered = await refreshInFlight;
    if (!recovered && recoverSession) {
      recoverInFlight ??= recoverSession().finally(() => {
        recoverInFlight = null;
      });
      recovered = await recoverInFlight;
    }
    if (recovered) return request<T>(path, { ...options, _retry: true });
    onUnauthorized?.();
  } else if (res.status === 401) {
    onUnauthorized?.();
  }

  const contentType = res.headers.get("content-type") ?? "";
  const payload =
    res.status === 204
      ? (undefined as unknown)
      : contentType.includes("application/json")
        ? await res.json()
        : await res.text();

  if (!res.ok) {
    throw new HttpError(res.status, res.statusText, payload);
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
