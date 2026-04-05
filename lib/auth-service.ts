// =============================================================================
// Afrikalytics Dashboard — Centralized Auth Service
// =============================================================================
// Handles all public auth API calls (login, register, forgot-password, etc.)
// Uses postPublic from api.ts for consistent error handling.
// =============================================================================

import type { User } from "./types";
import { api, saveSession } from "./api";

// -----------------------------------------------------------------------------
// Response types
// -----------------------------------------------------------------------------

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
  requires_verification?: boolean;
  status?: string;
  message?: string;
  email?: string;
}

interface RegisterResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: User;
}

interface MessageResponse {
  message: string;
  detail?: string;
}

// -----------------------------------------------------------------------------
// Auth Service
// -----------------------------------------------------------------------------

/**
 * Login — returns user or indicates 2FA verification needed.
 * Caller is responsible for saveSession() and navigation.
 */
async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return api.postPublic<LoginResponse>("/api/auth/login", { email, password });
}

/**
 * Login + auto session save. Handles 2FA branching.
 * Returns { requiresVerification: true, email } if 2FA needed,
 * or { requiresVerification: false, user } on success.
 */
export async function loginAndSave(
  email: string,
  password: string
): Promise<
  | { requiresVerification: true; email: string }
  | { requiresVerification: false; user: User }
> {
  const data = await login(email, password);

  if (data.requires_verification) {
    return { requiresVerification: true, email: data.email || email };
  }

  await saveSession(data.access_token, data.user, data.refresh_token);
  return { requiresVerification: false, user: data.user };
}

/**
 * Register a new user and save session.
 */
export async function registerAndSave(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const data = await api.postPublic<RegisterResponse>("/api/auth/register", {
    name,
    email,
    password,
  });
  await saveSession(data.access_token, data.user, data.refresh_token);
  return data.user;
}

/**
 * Request a password reset email.
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  return api.postPublic<MessageResponse>("/api/auth/forgot-password", {
    email,
  });
}

/**
 * Reset password with token from email link.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<MessageResponse> {
  return api.postPublic<MessageResponse>("/api/auth/reset-password", {
    token,
    new_password: newPassword,
  });
}

/**
 * Verify 2FA code and save session on success.
 */
export async function verifyCodeAndSave(
  email: string,
  code: string
): Promise<User> {
  const data = await api.postPublic<LoginResponse>("/api/auth/verify-code", {
    email,
    code,
  });
  await saveSession(data.access_token, data.user, data.refresh_token);
  return data.user;
}

/**
 * Resend the 2FA verification code.
 */
export async function resendCode(email: string): Promise<MessageResponse> {
  return api.postPublic<MessageResponse>("/api/auth/resend-code", { email });
}
