"use client";

// =============================================================================
// Afrikalytics Dashboard — useAuth Hook
// =============================================================================
// Fetches auth state from httpOnly cookies via /api/auth/session.
// No token or user data is stored in localStorage (XSS-safe).
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "../types";
import { ROUTES, ADMIN_PERMISSIONS } from "../constants";
import type { AdminRolePermissions } from "../types";
import { clearSession, getSession } from "../api";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UseAuthOptions {
  /** If set, user must be admin. Value can be a specific permission to check. */
  requireAdmin?: boolean | keyof AdminRolePermissions;
  /** Where to redirect if not authenticated (default: /login) */
  redirectTo?: string;
  /** If true, skip the redirect (useful for pages that work with/without auth) */
  optional?: boolean;
}

export interface UseAuthReturn {
  /** The authenticated user, or null while loading / not logged in */
  user: User | null;
  /** The JWT token, or null */
  token: string | null;
  /** True while checking auth state */
  isLoading: boolean;
  /** True if the user has admin privileges */
  isAdmin: boolean;
  /** True if access was denied (user exists but lacks required permissions) */
  accessDenied: boolean;
  /** Clear auth state and redirect to login */
  logout: () => void;
  /** Check a specific admin permission for the current user */
  hasPermission: (permission: keyof AdminRolePermissions) => boolean;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    requireAdmin = false,
    redirectTo = ROUTES.LOGIN,
    optional = false,
  } = options;

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Logout function
  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
    setToken(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  // Permission checker
  const hasPermission = useCallback(
    (permission: keyof AdminRolePermissions): boolean => {
      if (!user?.is_admin) return false;
      const role = user.admin_role || "super_admin";
      return ADMIN_PERMISSIONS[role]?.[permission] ?? false;
    },
    [user]
  );

  // Auth check on mount — fetches from httpOnly cookie via API route
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const session = await getSession();

        if (cancelled) return;

        if (!session.authenticated || !session.user) {
          if (!optional) {
            router.push(redirectTo);
          }
          setIsLoading(false);
          return;
        }

        const parsedUser = session.user;

        // Admin check
        if (requireAdmin) {
          if (!parsedUser.is_admin) {
            setAccessDenied(true);
            setUser(parsedUser);
            setToken(session.token);
            setIsLoading(false);
            return;
          }

          if (typeof requireAdmin === "string") {
            const role = parsedUser.admin_role || "super_admin";
            const perms = ADMIN_PERMISSIONS[role];
            if (!perms?.[requireAdmin]) {
              setAccessDenied(true);
              setUser(parsedUser);
              setToken(session.token);
              setIsLoading(false);
              return;
            }
          }
        }

        setUser(parsedUser);
        setToken(session.token);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          if (!optional) {
            router.push(redirectTo);
          }
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, redirectTo, requireAdmin, optional]);

  return {
    user,
    token,
    isLoading,
    isAdmin: user?.is_admin ?? false,
    accessDenied,
    logout,
    hasPermission,
  };
}
