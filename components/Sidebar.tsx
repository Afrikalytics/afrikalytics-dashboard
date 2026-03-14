"use client";

// =============================================================================
// Afrikalytics Dashboard — Shared Sidebar Component
// =============================================================================
// Extracted from the ~150-line sidebar duplicated across 10+ pages.
// Supports: responsive mobile drawer, admin sub-menu with RBAC, user info, logout.
// =============================================================================

import { useState } from "react";
import {
  BarChart3,
  FileText,
  TrendingUp,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  ChevronDown,
  Users,
  Lightbulb,
  Download,
} from "lucide-react";
import type { User } from "@/lib/types";
import type { AdminRolePermissions } from "@/lib/types";
import { ADMIN_PERMISSIONS, ROUTES } from "@/lib/constants";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface SidebarProps {
  /** Current route path (used to highlight the active nav item) */
  currentPath: string;
  /** The authenticated user */
  user: User | null;
  /** Logout handler */
  onLogout: () => void;
}

// -----------------------------------------------------------------------------
// Navigation items
// -----------------------------------------------------------------------------

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If set, only show when this condition is true */
  show?: boolean;
  /** Badge text (e.g. team member count) */
  badge?: string;
}

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function hasPermission(user: User | null, permission: keyof AdminRolePermissions): boolean {
  if (!user?.is_admin) return false;
  const role = user.admin_role || "super_admin";
  return ADMIN_PERMISSIONS[role]?.[permission] ?? false;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function Sidebar({ currentPath, user, onLogout }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { href: ROUTES.DASHBOARD, label: "Dashboard", icon: BarChart3 },
    { href: ROUTES.ETUDES, label: "Etudes", icon: FileText },
    { href: ROUTES.INSIGHTS, label: "Insights", icon: TrendingUp },
    { href: ROUTES.PROFILE, label: "Profil", icon: UserIcon },
    {
      href: ROUTES.EQUIPE,
      label: "Mon Equipe",
      icon: Users,
      show: user?.plan === "entreprise" && !user?.parent_user_id,
      badge: "5",
    },
  ];

  // Admin sub-menu items (filtered by permissions)
  const adminNavItems: NavItem[] = [
    {
      href: ROUTES.ADMIN,
      label: "Etudes",
      icon: FileText,
      show: hasPermission(user, "studies"),
    },
    {
      href: ROUTES.ADMIN_INSIGHTS,
      label: "Insights",
      icon: Lightbulb,
      show: hasPermission(user, "insights"),
    },
    {
      href: ROUTES.ADMIN_REPORTS,
      label: "Rapports",
      icon: Download,
      show: hasPermission(user, "reports"),
    },
    {
      href: ROUTES.ADMIN_USERS,
      label: "Utilisateurs",
      icon: Users,
      show: hasPermission(user, "users"),
    },
  ];

  const isActive = (href: string) => currentPath === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
        aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed h-full bg-gray-900 text-white z-40 transition-transform duration-300
          w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg">Afrikalytics</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {mainNavItems
            .filter((item) => item.show === undefined || item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}

          {/* Admin Menu */}
          {user?.is_admin && (
            <>
              <div className="border-t border-gray-800 my-4" />

              {/* Admin toggle button */}
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                aria-expanded={adminMenuOpen}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Administration</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    adminMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Admin sub-menu (animated) */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  adminMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 space-y-1 mt-1">
                  {adminNavItems
                    .filter((item) => item.show)
                    .map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                            active
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </a>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </nav>

        {/* User info + Logout (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-700 p-2 rounded-full">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.full_name}</p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition w-full px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
