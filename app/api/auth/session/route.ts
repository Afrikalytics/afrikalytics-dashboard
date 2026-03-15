import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth-token";
const USER_COOKIE = "auth-user";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function setCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** GET /api/auth/session — returns current user from httpOnly cookie */
export async function GET() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const userRaw = cookieStore.get(USER_COOKIE)?.value;

  if (!token || !userRaw) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = JSON.parse(decodeURIComponent(userRaw));
    // Token is NOT returned to client JS — it stays in the httpOnly cookie
    // and is only accessed server-side by the proxy route
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

/** POST /api/auth/session — stores token + user in httpOnly cookies */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, user } = body;

  if (!token || !user) {
    return NextResponse.json({ error: "Token and user required" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, token, setCookieOptions(MAX_AGE));
  // User cookie is also httpOnly to prevent XSS access to admin roles (VUL-02)
  // Client reads user data via GET /api/auth/session (server-side cookie parsing)
  response.cookies.set(
    USER_COOKIE,
    encodeURIComponent(JSON.stringify(user)),
    setCookieOptions(MAX_AGE)
  );

  return response;
}

/** DELETE /api/auth/session — clears auth cookies */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, "", setCookieOptions(0));
  response.cookies.set(USER_COOKIE, "", setCookieOptions(0));

  return response;
}
