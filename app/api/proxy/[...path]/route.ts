import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://web-production-ef657.up.railway.app";

const COOKIE_NAME = "auth-token";

async function proxyRequest(request: NextRequest, method: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Extract the path after /api/proxy/
  const url = new URL(request.url);
  const proxyPath = url.pathname.replace(/^\/api\/proxy/, "");
  const targetUrl = `${API_URL}${proxyPath}${url.search}`;

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

    // Handle 401 — clear auth cookies
    if (response.status === 401) {
      const res = NextResponse.json(
        { detail: "Session expiree. Veuillez vous reconnecter." },
        { status: 401 }
      );
      res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
      res.cookies.set("auth-user", "", { path: "/", maxAge: 0 });
      return res;
    }

    // Forward the response
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // For non-JSON responses (e.g., PDF downloads)
    const blob = await response.blob();
    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "Erreur de connexion au serveur" },
      { status: 502 }
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
