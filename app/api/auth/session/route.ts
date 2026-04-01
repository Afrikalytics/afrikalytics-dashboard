import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth-token";
const USER_COOKIE = "auth-user";
const REFRESH_COOKIE = "auth-refresh-token";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// SECURITY: Allowed plans and admin roles — used to validate session POST body
const VALID_PLANS = ["basic", "professionnel", "entreprise"];
const VALID_ADMIN_ROLES = [
  "super_admin",
  "admin_content",
  "admin_studies",
  "admin_insights",
  "admin_reports",
];

// SECURITY: Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "https://dashboard.afrikalytics.com",
  "http://localhost:3000",
].filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.some((allowed) => origin === allowed)) return true;
  // Only allow Afrikalytics Vercel preview deploys (project-specific prefix)
  return /^https:\/\/afrikalytics-dashboard[\w-]*\.vercel\.app$/.test(origin);
}

/**
 * Validate and sanitize the session body without external dependencies.
 * Returns the validated { token, user } or null if invalid.
 */
function validateSessionBody(
  body: unknown,
): { token: string; user: Record<string, unknown>; refreshToken?: string } | null {
  if (typeof body !== "object" || body === null) return null;

  const { token, user, refreshToken } = body as Record<string, unknown>;

  if (typeof token !== "string" || token.length < 1 || token.length > 4096)
    return null;
  if (typeof user !== "object" || user === null || Array.isArray(user))
    return null;

  const u = user as Record<string, unknown>;

  if (typeof u.id !== "number" || !Number.isFinite(u.id)) return null;
  if (typeof u.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email))
    return null;
  if (typeof u.full_name !== "string") return null;
  if (typeof u.plan !== "string" || !VALID_PLANS.includes(u.plan)) return null;
  if (typeof u.is_admin !== "boolean") return null;
  if (
    u.admin_role !== null &&
    u.admin_role !== undefined &&
    (typeof u.admin_role !== "string" ||
      !VALID_ADMIN_ROLES.includes(u.admin_role))
  )
    return null;

  // Return only validated fields — strip any extra fields from the user object
  const sanitizedUser = {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    plan: u.plan,
    is_admin: u.is_admin,
    admin_role: u.admin_role ?? null,
  };

  const validatedRefresh =
    typeof refreshToken === "string" && refreshToken.length > 0 && refreshToken.length <= 4096
      ? refreshToken
      : undefined;

  return { token, user: sanitizedUser, refreshToken: validatedRefresh };
}

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
  // SECURITY: CSRF protection via Origin header validation
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // SECURITY: Validate and sanitize the request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateSessionBody(body);
  if (!validated) {
    return NextResponse.json(
      { error: "Invalid session data" },
      { status: 400 },
    );
  }

  const { token, user, refreshToken } = validated;

  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, token, setCookieOptions(MAX_AGE));
  // User cookie is also httpOnly to prevent XSS access to admin roles
  // Client reads user data via GET /api/auth/session (server-side cookie parsing)
  response.cookies.set(
    USER_COOKIE,
    encodeURIComponent(JSON.stringify(user)),
    setCookieOptions(MAX_AGE),
  );

  // Store refresh token in a separate httpOnly cookie with longer TTL
  if (refreshToken) {
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      ...setCookieOptions(REFRESH_MAX_AGE),
      sameSite: "strict" as const, // stricter for refresh token
    });
  }

  return response;
}

/** DELETE /api/auth/session — clears all auth cookies */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, "", setCookieOptions(0));
  response.cookies.set(USER_COOKIE, "", setCookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, "", setCookieOptions(0));

  return response;
}
