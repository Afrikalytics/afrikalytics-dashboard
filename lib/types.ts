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
// Notifications
// -----------------------------------------------------------------------------

/** Notification types matching backend enum */
export type NotificationType =
  | 'study_created'
  | 'insight_generated'
  | 'payment_confirmed'
  | 'anomaly_detected'
  | 'system';

/** In-app notification object returned by the API */
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

/** Paginated notification list response */
export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
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

// -----------------------------------------------------------------------------
// Payments / Billing
// -----------------------------------------------------------------------------

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  plan: string;
  payment_method: string;
  created_at: string;
  reference: string | null;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
  current_page: number;
}

export interface PlanFeatures {
  max_studies: number;
  max_team_members: number;
  export_pdf: boolean;
  api_access: boolean;
  custom_branding: boolean;
  price_monthly: number;
  price_label: string;
}

export interface CurrentPlanResponse {
  plan: string;
  is_active: boolean;
  expires_at: string | null;
  features: PlanFeatures;
}

export interface PlanInfo {
  name: string;
  key: string;
  features: PlanFeatures;
}

// -----------------------------------------------------------------------------
// Dashboard Builder
// -----------------------------------------------------------------------------

/** Chart/widget types available in the Dashboard Builder */
export type ChartType =
  | 'bar' | 'line' | 'area' | 'pie' | 'donut'
  | 'scatter' | 'radar' | 'funnel'
  | 'stat-card' | 'table' | 'kpi';

/** Configuration options for a dashboard widget's visual rendering */
export interface WidgetConfig {
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisKey?: string;
  yAxisKeys?: string[];
  valueKey?: string;
  labelKey?: string;
  unit?: string;
  format?: 'number' | 'currency' | 'percent';
}

/** A single widget placed on a custom dashboard */
export interface DashboardWidget {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
  dataSource: {
    studyId?: number;
    columns: string[];
    filters?: Record<string, unknown>;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
}

/** A complete dashboard layout containing positioned widgets */
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  isTemplate?: boolean;
  templateCategory?: string;
}
