"use client";

// =============================================================================
// Afrikalytics Dashboard — Auth Context
// =============================================================================
// Provides authenticated user state to all dashboard pages via context,
// eliminating the need for each page to call useAuth() independently.
// =============================================================================

import { createContext, useContext } from "react";
import type { UseAuthReturn } from "../hooks/useAuth";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<UseAuthReturn | null>(null);

// -----------------------------------------------------------------------------
// Provider (wraps children with auth state)
// -----------------------------------------------------------------------------

interface AuthProviderProps {
  value: UseAuthReturn;
  children: React.ReactNode;
}

export function AuthProvider({ value, children }: AuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Consumer hook
// -----------------------------------------------------------------------------

/**
 * Access the authenticated user from context.
 * Must be used within a component tree wrapped by AuthProvider.
 *
 * Usage:
 *   const { user, logout, hasPermission } = useAuthContext();
 */
export function useAuthContext(): UseAuthReturn {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
