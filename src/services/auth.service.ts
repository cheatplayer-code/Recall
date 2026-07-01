import { http } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import { mapUser, type UserDTO } from "@/lib/api/mappers";
import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  TokenResponse,
  User,
} from "@/types";

/**
 * Authentication data access — the ONLY place that knows the backend's auth
 * contract. Assumed FastAPI endpoints (confirm with backend dev):
 *
 *   POST /auth/register  { name, email, password }      -> TokenResponse
 *   POST /auth/login     { email, password }            -> TokenResponse
 *   GET  /auth/me                                        -> User
 *   POST /auth/refresh   { refresh_token }               -> TokenResponse
 *   POST /auth/logout                                    -> 204
 *
 * If the real routes differ, only this file changes.
 */
function toTokens(res: TokenResponse): AuthTokens {
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    tokenType: res.token_type,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    return toTokens(
      await http.post<TokenResponse>(endpoints.auth.login, credentials, {
        auth: false,
      }),
    );
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    // Backend expects { email, password, fullName }.
    return toTokens(
      await http.post<TokenResponse>(
        endpoints.auth.register,
        {
          email: payload.email,
          password: payload.password,
          fullName: payload.name,
        },
        { auth: false },
      ),
    );
  },

  async me(): Promise<User> {
    return mapUser(await http.get<UserDTO>(endpoints.auth.me));
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    return toTokens(
      await http.post<TokenResponse>(
        endpoints.auth.refresh,
        { refresh_token: refreshToken },
        { auth: false },
      ),
    );
  },

  /** Best-effort server-side logout; never throws (local clear is the source of truth). */
  async logout(): Promise<void> {
    try {
      await http.post<void>(endpoints.auth.logout);
    } catch {
      // ignore — the client clears its own session regardless.
    }
  },
};
