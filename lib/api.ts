// =============================================================================
// Afrikalytics Dashboard — Centralized API Service
// =============================================================================
// Replaces duplicated fetch() calls across all pages.
// Handles auth headers, 401 redirects, and typed error responses.
// =============================================================================

import { API_URL, AUTH_TOKEN_KEY, ROUTES } from "./constants";
import type { ApiError } from "./types";

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
// API Service
// -----------------------------------------------------------------------------

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Read the JWT token from localStorage (client-side only) */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /** Build headers with optional Authorization */
  private getHeaders(includeContentType = true): HeadersInit {
    const headers: Record<string, string> = {};

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /** Handle the response — parse JSON, handle 401 redirects, throw on errors */
  private async handleResponse<T>(response: Response): Promise<T> {
    // 401 Unauthorized — clear auth and redirect to login
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = ROUTES.LOGIN;
      }
      throw new ApiRequestError(401, "Session expirée. Veuillez vous reconnecter.");
    }

    // Try to parse JSON body (some endpoints may return empty body)
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

  /** GET request */
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: this.getHeaders(false),
    });
    return this.handleResponse<T>(response);
  }

  /** POST request */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /** PUT request */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  /** DELETE request */
  async delete<T = void>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(false),
    });
    return this.handleResponse<T>(response);
  }

  /** POST without auth (for login, register, etc.) */
  async postPublic<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export const api = new ApiService(API_URL);
