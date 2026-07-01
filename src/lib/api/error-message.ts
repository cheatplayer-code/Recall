import { HttpError } from "./http";

/** Shape of the backend's structured error envelope. */
interface BackendError {
  error?: { message?: string; code?: string };
}

function backendMessage(error: HttpError): string | undefined {
  const body = error.body as BackendError | undefined;
  return body?.error?.message;
}

/**
 * Turn any thrown error into a calm, human message for the UI. Prefers the
 * backend's own friendly message, maps common HTTP statuses, and detects
 * transport failures (fetch rejects with a TypeError when the server is
 * unreachable / CORS-blocked). One place so every surface speaks the same voice.
 */
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof HttpError) {
    const fromBackend = backendMessage(error);
    switch (error.status) {
      case 400:
        return fromBackend ?? "That didn't look right. Please check and try again.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You don't have access to that.";
      case 404:
        return fromBackend ?? "We couldn't find that.";
      case 409:
        return fromBackend ?? "This already exists.";
      case 413:
        return fromBackend ?? "This file is too large.";
      case 415:
        return fromBackend ?? "That file type isn't supported.";
      case 429:
        return "Too many requests — please slow down for a moment.";
    }
    if (error.status >= 500) return "The server had a problem. Please try again.";
    return fromBackend ?? fallback;
  }
  // fetch() rejects with a TypeError on network / transport failure.
  if (error instanceof TypeError) {
    return "Connection lost. Check your network and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Auth-specific phrasing for the login/register forms. */
export function authErrorMessage(error: unknown, mode: "login" | "register"): string {
  if (error instanceof HttpError) {
    if (mode === "login" && error.status === 401) {
      return "Incorrect email or password.";
    }
    if (mode === "register" && error.status === 409) {
      return "An account with this email already exists.";
    }
    if (error.status === 422) {
      return "Please enter a valid email and a password of at least 8 characters.";
    }
  }
  return errorMessage(error, "We couldn't sign you in. Please try again.");
}
