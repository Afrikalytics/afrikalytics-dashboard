// =============================================================================
// Afrikalytics Dashboard — Centralized API Service
// =============================================================================
// All API calls go through /api/proxy/ which injects the auth token from
// httpOnly cookies server-side. No token is ever exposed to client JS.
// =============================================================================

import { API_URL, ROUTES } from "./constants";
import type { User } from "./types";

// -----------------------------------------------------------------------------
// Custom error class for API errors
// -----------------------------------------------------------------------------

export class ApiRequestError extends Error {
  public status: number;
  public detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiRequestError";
    this.status = status;
    this.detail = detail;
  }
}

// -----------------------------------------------------------------------------
// Session helpers (httpOnly cookie management via /api/auth/session)
// -----------------------------------------------------------------------------

/** Save auth session (token + user) in httpOnly cookies */
export async function saveSession(token: string, user: User): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, user }),
  });
}

/** Clear auth session (httpOnly cookies) */
export async function clearSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

/** Get current session from httpOnly cookies */
export async function getSession(): Promise<{
  authenticated: boolean;
  user: User | null;
  token: string | null;
}> {
  const res = await fetch("/api/auth/session");
  return res.json();
}

// -----------------------------------------------------------------------------
// API Service — routes through /api/proxy/ for authenticated requests
// -----------------------------------------------------------------------------

class ApiService {
  /** Handle the response — parse JSON, handle 401 redirects, throw on errors */
  private async handleResponse<T>(response: Response): Promise<T> {
    // 401 Unauthorized — clear session and redirect
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        await clearSession();
        window.location.href = ROUTES.LOGIN;
      }
      throw new ApiRequestError(401, "Session expiree. Veuillez vous reconnecter.");
    }

    // Try to parse JSON body
    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    // Non-OK responses
    if (!response.ok) {
      const detail =
        data?.detail ||
        data?.message ||
        `Erreur ${response.status}`;
      throw new ApiRequestError(response.status, detail);
    }

    return data as T;
  }

  /** GET request (through proxy — auth token injected server-side) */
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`/api/proxy${path}`, {
      method: "GET",
    });
    return this.handleResponse<T>(response);
  }

  /** POST request (through proxy) */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`/api/proxy${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /** PUT request (through proxy) */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`/api/proxy${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /** DELETE request (through proxy) */
  async delete<T = void>(path: string): Promise<T> {
    const response = await fetch(`/api/proxy${path}`, {
      method: "DELETE",
    });
    return this.handleResponse<T>(response);
  }

  /** POST without auth (for login, register — calls Railway directly) */
  async postPublic<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data?.detail || data?.message || `Erreur ${response.status}`;
      throw new ApiRequestError(response.status, detail);
    }

    return data as T;
  }
}

// -----------------------------------------------------------------------------
// Singleton export
// -----------------------------------------------------------------------------

export const api = new ApiService();
