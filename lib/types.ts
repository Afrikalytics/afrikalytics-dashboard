// =============================================================================
// Afrikalytics Dashboard — Shared TypeScript Types
// =============================================================================
// Centralized type definitions extracted from inline page definitions.
// All pages should import from here instead of defining types locally.
// =============================================================================

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------

/** Admin role codes used for RBAC */
export type AdminRole =
  | "super_admin"
  | "admin_content"
  | "admin_studies"
  | "admin_insights"
  | "admin_reports";

/** User plan tiers */
export type UserPlan = "basic" | "professionnel" | "entreprise";

/** Core user object returned by the API */
export interface User {
  id: number;
  email: string;
  full_name: string;
  plan: UserPlan;
  is_active: boolean;
  is_admin: boolean;
  admin_role: AdminRole | null;
  parent_user_id: number | null;
  is_verified?: boolean;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Studies
// -----------------------------------------------------------------------------

export interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  deadline: string;
  status: string;
  icon: string;
  is_active: boolean;
  embed_url_results?: string;
  created_at?: string;
}

// -----------------------------------------------------------------------------
// Insights
// -----------------------------------------------------------------------------

export interface Insight {
  id: number;
  study_id: number;
  title: string;
  summary: string;
  content?: string;
  category?: string;
  image_url?: string;
  is_published: boolean;
  author: string;
  created_at?: string;
}

// -----------------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------------

export interface Report {
  id: number;
  study_id: number;
  title: string;
  file_url: string;
  file_size: string;
  is_available: boolean;
  created_at?: string;
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

export interface DashboardStats {
  studies_accessible: number;
  studies_total: number;
  studies_open: number;
  reports_available: number;
  insights_available: number;
  subscription_days_remaining: number | null;
  plan: string;
  is_premium: boolean;
}

export interface TokenInfo {
  name: string;
  limit: number;
  unlimited: boolean;
  used: number;
  remaining: number | null;
  percentage: number;
}

export interface QuotaData {
  plan: string;
  tokens: TokenInfo[];
  days_remaining: number | null;
  subscription_end: string | null;
  billing_period_start: string;
}

// -----------------------------------------------------------------------------
// Admin Roles (extended metadata for UI)
// -----------------------------------------------------------------------------

export interface AdminRolePermissions {
  studies: boolean;
  insights: boolean;
  reports: boolean;
  users: boolean;
}

export interface AdminRoleInfo {
  code: AdminRole;
  label: string;
  description: string;
  color: string;
  permissions: AdminRolePermissions;
}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

export interface ApiError {
  detail: string;
  status: number;
}

// -----------------------------------------------------------------------------
// Auth (login response)
// -----------------------------------------------------------------------------

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  requires_verification?: boolean;
}

// -----------------------------------------------------------------------------
// Blog / Newsletter (for future use — present in API models)
// -----------------------------------------------------------------------------

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  author: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Contact
// -----------------------------------------------------------------------------

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}
