// =============================================================================
// Afrikalytics Dashboard — Shared Constants
// =============================================================================

import type { AdminRole, AdminRoleInfo, AdminRolePermissions } from "./types";

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://web-production-ef657.up.railway.app";

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

export const ROUTES = {
  // Public
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_CODE: "/verify-code",

  // Dashboard (authenticated)
  DASHBOARD: "/dashboard",
  ETUDES: "/dashboard/etudes",
  ETUDE_DETAIL: (id: number | string) => `/dashboard/etudes/${id}`,
  INSIGHTS: "/dashboard/insights",
  INSIGHT_DETAIL: (id: number | string) => `/dashboard/insights/${id}`,
  EQUIPE: "/dashboard/equipe",
  PROFILE: "/profile",
  PAYMENT_SUCCESS: "/payment-success",

  // Admin
  ADMIN: "/admin",
  ADMIN_AJOUTER: "/admin/ajouter",
  ADMIN_MODIFIER: (id: number | string) => `/admin/modifier/${id}`,
  ADMIN_INSIGHTS: "/admin/insights",
  ADMIN_INSIGHTS_CREER: "/admin/insights/creer",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_REPORTS_AJOUTER: "/admin/reports/ajouter",
  ADMIN_USERS: "/admin/users",

  // External
  PREMIUM: "https://afrikalytics.com/premium",
  WEBSITE: "https://afrikalytics.com",
} as const;

// -----------------------------------------------------------------------------
// Admin Permissions (RBAC)
// -----------------------------------------------------------------------------

export const ADMIN_PERMISSIONS: Record<AdminRole, AdminRolePermissions> = {
  super_admin: { studies: true, insights: true, reports: true, users: true },
  admin_content: { studies: true, insights: true, reports: true, users: false },
  admin_studies: { studies: true, insights: false, reports: false, users: false },
  admin_insights: { studies: false, insights: true, reports: false, users: false },
  admin_reports: { studies: false, insights: false, reports: true, users: false },
};

/** Check whether a user (by admin_role) has a specific permission */
export function hasAdminPermission(
  adminRole: AdminRole | string | null | undefined,
  permission: keyof AdminRolePermissions
): boolean {
  const role = (adminRole || "super_admin") as AdminRole;
  return ADMIN_PERMISSIONS[role]?.[permission] ?? false;
}

// -----------------------------------------------------------------------------
// Admin Roles (extended metadata for the admin users page)
// -----------------------------------------------------------------------------

export const ADMIN_ROLES: AdminRoleInfo[] = [
  {
    code: "super_admin",
    label: "Super Admin",
    description: "Acces complet a tout",
    color: "bg-red-100 text-red-800",
    permissions: { studies: true, insights: true, reports: true, users: true },
  },
  {
    code: "admin_content",
    label: "Admin Contenu",
    description: "Etudes, Insights, Rapports",
    color: "bg-purple-100 text-purple-800",
    permissions: { studies: true, insights: true, reports: true, users: false },
  },
  {
    code: "admin_studies",
    label: "Admin Etudes",
    description: "Etudes uniquement",
    color: "bg-blue-100 text-blue-800",
    permissions: { studies: true, insights: false, reports: false, users: false },
  },
  {
    code: "admin_insights",
    label: "Admin Insights",
    description: "Insights uniquement",
    color: "bg-yellow-100 text-yellow-800",
    permissions: { studies: false, insights: true, reports: false, users: false },
  },
  {
    code: "admin_reports",
    label: "Admin Rapports",
    description: "Rapports uniquement",
    color: "bg-green-100 text-green-800",
    permissions: { studies: false, insights: false, reports: true, users: false },
  },
];

// -----------------------------------------------------------------------------
// Plan Badges (UI display helpers)
// -----------------------------------------------------------------------------

export const PLAN_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  basic: { bg: "bg-gray-100", text: "text-gray-700", label: "Basic" },
  professionnel: { bg: "bg-blue-100", text: "text-blue-700", label: "Professionnel" },
  entreprise: { bg: "bg-purple-100", text: "text-purple-700", label: "Entreprise" },
};

export const PLAN_DETAILS: Record<string, { name: string; price: string; color: string }> = {
  basic: { name: "Basic", price: "Gratuit", color: "bg-gray-100 text-gray-700" },
  professionnel: { name: "Professionnel", price: "295 000 CFA/mois", color: "bg-blue-100 text-blue-700" },
  entreprise: { name: "Entreprise", price: "Sur mesure", color: "bg-purple-100 text-purple-700" },
};

// -----------------------------------------------------------------------------
// Token Labels (for quota display)
// -----------------------------------------------------------------------------

export const TOKEN_LABELS: Record<string, { label: string; icon: string }> = {
  reports_downloads: { label: "Rapports", icon: "download" },
  insights_access: { label: "Insights", icon: "lightbulb" },
  studies_participation: { label: "Etudes", icon: "file" },
  api_requests: { label: "Requetes API", icon: "zap" },
};

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
