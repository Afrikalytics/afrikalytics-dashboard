"use client";

// =============================================================================
// Afrikalytics Dashboard — useAuth Hook
// =============================================================================
// Centralizes the auth check pattern duplicated across ~15 pages:
//   1. Read token/user from localStorage
//   2. Redirect to /login if missing
//   3. Optionally check admin role
//   4. Return user, token, loading state, and logout function
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "../types";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, ROUTES, ADMIN_PERMISSIONS } from "../constants";
import type { AdminRolePermissions } from "../types";

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
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      // Clear auth cookie used by middleware
      document.cookie = "auth-token=; path=/; max-age=0";
    }
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

  // Auth check on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    // No credentials found
    if (!storedToken || !storedUser) {
      if (!optional) {
        router.push(redirectTo);
      }
      setIsLoading(false);
      return;
    }

    // Parse user
    let parsedUser: User;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      if (!optional) {
        router.push(redirectTo);
      }
      setIsLoading(false);
      return;
    }

    // Admin check
    if (requireAdmin) {
      if (!parsedUser.is_admin) {
        setAccessDenied(true);
        setUser(parsedUser);
        setToken(storedToken);
        setIsLoading(false);
        return;
      }

      // Check specific permission if requireAdmin is a permission key
      if (typeof requireAdmin === "string") {
        const role = parsedUser.admin_role || "super_admin";
        const perms = ADMIN_PERMISSIONS[role];
        if (!perms?.[requireAdmin]) {
          setAccessDenied(true);
          setUser(parsedUser);
          setToken(storedToken);
          setIsLoading(false);
          return;
        }
      }
    }

    setUser(parsedUser);
    setToken(storedToken);
    setIsLoading(false);
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
