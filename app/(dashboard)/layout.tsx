"use client";

// =============================================================================
// Afrikalytics Dashboard — Shared Dashboard Layout
// =============================================================================
// Route Group layout for all authenticated pages (dashboard, admin, profile).
// Centralizes: auth check, sidebar rendering, main content wrapper, loading state.
// Uses Next.js Route Groups — (dashboard) does NOT affect URLs.
// =============================================================================

import { usePathname } from "next/navigation";
import { ShieldX, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";

// -----------------------------------------------------------------------------
// Loading skeleton (replaces per-page loading states)
// -----------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2
            className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4"
            role="status"
            aria-label="Chargement en cours"
          />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Access denied screen (replaces per-page access denied states)
// -----------------------------------------------------------------------------

function AccessDeniedScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acces refuse</h1>
        <p className="text-gray-600 mb-6">
          Cette page est reservee aux administrateurs. Vous n&apos;avez pas les
          permissions necessaires pour y acceder.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Retour au dashboard
        </a>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Layout Component
// -----------------------------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, accessDenied, logout } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show access denied screen if user lacks permissions
  if (accessDenied) {
    return <AccessDeniedScreen />;
  }

  // User is authenticated — render sidebar + content
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath={pathname} user={user} onLogout={logout} />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8"
      >
        {children}
      </main>
    </div>
  );
}
