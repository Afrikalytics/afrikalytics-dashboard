"use client";

// =============================================================================
// Afrikalytics Dashboard — Shared Dashboard Layout (Corporate Premium)
// =============================================================================

import { usePathname } from "next/navigation";
import { ShieldX } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/Button";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/PageTransition";

// -----------------------------------------------------------------------------
// Loading State — Corporate Skeleton
// -----------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block fixed h-full w-64 bg-white border-r border-surface-200" />
      <div className="lg:ml-64 p-6 lg:p-10 pt-16 lg:pt-10">
        <PageSkeleton />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Access Denied — Corporate Style
// -----------------------------------------------------------------------------

function AccessDeniedScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="border border-surface-200 p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-8">
          <ShieldX className="h-7 w-7 text-surface-400" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-surface-900 mb-2 tracking-tight">
          Accès refusé
        </h1>
        <p className="text-sm text-surface-500 leading-relaxed mb-8">
          Cette page est réservée aux administrateurs. Vous n&apos;avez pas les
          permissions nécessaires pour y accéder.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Retour au dashboard
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, accessDenied, logout } = useAuth();

  if (isLoading) return <DashboardSkeleton />;
  if (accessDenied) return <AccessDeniedScreen />;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar currentPath={pathname} user={user} onLogout={logout} />

      <main
        id="main-content"
        role="main"
        aria-label="Contenu principal"
        tabIndex={-1}
        className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8"
      >
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
