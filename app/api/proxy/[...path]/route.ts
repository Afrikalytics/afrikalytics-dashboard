import { NextRequest, NextResponse } from "next/server";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_API_URL environment variable is required in production",
      );
    }
    return "http://localhost:8000";
  }
  return url;
}

const COOKIE_NAME = "auth-token";
const REFRESH_COOKIE = "auth-refresh-token";
const USER_COOKIE = "auth-user";

// SECURITY: Only allow proxying to known API path prefixes.
// Prevents access to internal backend endpoints (health, metrics, etc.)
const ALLOWED_PROXY_PREFIXES = [
  "/api/auth/",
  "/api/users/",
  "/api/studies/",
  "/api/insights/",
  "/api/reports/",
  "/api/dashboard/",
  "/api/payments/",
  "/api/contacts/",
  "/api/notifications/",
  "/api/analytics/",
  "/api/integrations/",
  "/api/admin/",
  "/api/blog/",
  "/api/newsletter/",
  "/api/exports/",
];

/**
 * Attempt to refresh the access token using the refresh token.
 * Returns new tokens on success, null on failure.
 */
async function attemptTokenRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const response = await fetch(`${getApiUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.access_token) return null;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch {
    return null;
  }
}

/** Forward a backend response as a NextResponse (JSON or blob). */
async function forwardResponse(response: Response): Promise<NextResponse> {
  const ct = response.headers.get("content-type");
  if (ct?.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }
  const blob = await response.blob();
  return new NextResponse(blob, {
    status: response.status,
    headers: { "Content-Type": ct || "application/octet-stream" },
  });
}

async function proxyRequest(request: NextRequest, method: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Extract the path after /api/proxy/
  const url = new URL(request.url);
  const rawProxyPath = url.pathname.replace(/^\/api\/proxy/, "");

  // SECURITY: Reject path traversal attempts before allowlist check.
  // Normalize by resolving ".." segments, then verify no escape occurred.
  const normalizedPath = new URL(rawProxyPath, "http://n").pathname;
  if (normalizedPath !== rawProxyPath || rawProxyPath.includes("..")) {
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  }

  // Validate path against allowlist
  const isAllowed = ALLOWED_PROXY_PREFIXES.some((prefix) =>
    normalizedPath.startsWith(prefix),
  );
  if (!isAllowed) {
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  }

  const targetUrl = `${getApiUrl()}${normalizedPath}${url.search}`;

  // Build headers
  const headers: Record<string, string> = {
    "X-Requested-With": "XMLHttpRequest",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Forward content-type for methods with body
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // Forward body for POST/PUT/PATCH
  if (["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // Handle 401 — attempt transparent token refresh before failing
    if (response.status === 401) {
      const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

      if (refreshToken) {
        const refreshResult = await attemptTokenRefresh(refreshToken);

        if (refreshResult) {
          // Retry the original request with the new access token
          headers["Authorization"] = `Bearer ${refreshResult.accessToken}`;
          const retryResponse = await fetch(targetUrl, { ...fetchOptions, headers });

          const res = await forwardResponse(retryResponse);
          // Update cookies with new tokens
          res.cookies.set(COOKIE_NAME, refreshResult.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
          });
          if (refreshResult.refreshToken) {
            res.cookies.set(REFRESH_COOKIE, refreshResult.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 30 * 24 * 60 * 60,
            });
          }
          return res;
        }
      }

      // Refresh failed or no refresh token — clear all cookies
      const res = NextResponse.json(
        { detail: "Session expiree. Veuillez vous reconnecter." },
        { status: 401 },
      );
      res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
      res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
      res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }

    return await forwardResponse(response);
  } catch {
    return NextResponse.json(
      { detail: "Erreur de connexion au serveur" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH");
}
