// =============================================================================
// Tests — lib/constants.ts
// =============================================================================
// TDD RED phase: tests for getApiUrl(), hasAdminPermission(), ROUTES helpers,
// ADMIN_PERMISSIONS, PLAN_BADGES, PLAN_DETAILS, TOKEN_LABELS, ADMIN_ROLES
// =============================================================================

import {
  getApiUrl,
  hasAdminPermission,
  ROUTES,
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  PLAN_BADGES,
  PLAN_DETAILS,
  TOKEN_LABELS,
} from "../constants";
import type { AdminRole } from "../types";

// -----------------------------------------------------------------------------
// getApiUrl()
// -----------------------------------------------------------------------------

describe("getApiUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset the cached _apiUrl by re-importing would be ideal,
    // but we can test the fallback behavior
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return localhost fallback in non-production when env var is missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (process.env as Record<string, string>).NODE_ENV = "test";
    // Re-import to reset cached value
    const { getApiUrl: freshGetApiUrl } = require("../constants");
    expect(freshGetApiUrl()).toBe("http://localhost:8000");
  });

  it("should return the env var value when NEXT_PUBLIC_API_URL is set", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.afrikalytics.com";
    const { getApiUrl: freshGetApiUrl } = require("../constants");
    expect(freshGetApiUrl()).toBe("https://api.afrikalytics.com");
  });

  it("should throw in production when env var is missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    (process.env as Record<string, string>).NODE_ENV = "production";

    // The module-level API_URL export calls getApiUrl() on import,
    // which throws in production. We must catch that.
    expect(() => {
      require("../constants");
    }).toThrow(
      "NEXT_PUBLIC_API_URL environment variable is required in production"
    );
  });
});

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

describe("ROUTES", () => {
  it("should have all public routes", () => {
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.REGISTER).toBe("/register");
    expect(ROUTES.FORGOT_PASSWORD).toBe("/forgot-password");
    expect(ROUTES.RESET_PASSWORD).toBe("/reset-password");
    expect(ROUTES.VERIFY_CODE).toBe("/verify-code");
  });

  it("should have all dashboard routes", () => {
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.ETUDES).toBe("/dashboard/etudes");
    expect(ROUTES.INSIGHTS).toBe("/dashboard/insights");
    expect(ROUTES.EQUIPE).toBe("/dashboard/equipe");
    expect(ROUTES.PROFILE).toBe("/profile");
    expect(ROUTES.FACTURATION).toBe("/dashboard/facturation");
  });

  it("should have all admin routes", () => {
    expect(ROUTES.ADMIN).toBe("/admin");
    expect(ROUTES.ADMIN_AJOUTER).toBe("/admin/ajouter");
    expect(ROUTES.ADMIN_INSIGHTS).toBe("/admin/insights");
    expect(ROUTES.ADMIN_REPORTS).toBe("/admin/reports");
    expect(ROUTES.ADMIN_USERS).toBe("/admin/users");
  });

  it("should generate dynamic route for ETUDE_DETAIL", () => {
    expect(ROUTES.ETUDE_DETAIL(42)).toBe("/dashboard/etudes/42");
    expect(ROUTES.ETUDE_DETAIL("abc")).toBe("/dashboard/etudes/abc");
  });

  it("should generate dynamic route for INSIGHT_DETAIL", () => {
    expect(ROUTES.INSIGHT_DETAIL(7)).toBe("/dashboard/insights/7");
    expect(ROUTES.INSIGHT_DETAIL("xyz")).toBe("/dashboard/insights/xyz");
  });

  it("should generate dynamic route for ADMIN_MODIFIER", () => {
    expect(ROUTES.ADMIN_MODIFIER(1)).toBe("/admin/modifier/1");
    expect(ROUTES.ADMIN_MODIFIER("99")).toBe("/admin/modifier/99");
  });

  it("should have external URLs", () => {
    expect(ROUTES.PREMIUM).toMatch(/^https:\/\//);
    expect(ROUTES.WEBSITE).toMatch(/^https:\/\//);
  });
});

// -----------------------------------------------------------------------------
// ADMIN_PERMISSIONS
// -----------------------------------------------------------------------------

describe("ADMIN_PERMISSIONS", () => {
  it("should grant super_admin all permissions", () => {
    expect(ADMIN_PERMISSIONS.super_admin).toEqual({
      studies: true,
      insights: true,
      reports: true,
      users: true,
    });
  });

  it("should grant admin_content studies, insights, reports but not users", () => {
    expect(ADMIN_PERMISSIONS.admin_content).toEqual({
      studies: true,
      insights: true,
      reports: true,
      users: false,
    });
  });

  it("should grant admin_studies only studies permission", () => {
    expect(ADMIN_PERMISSIONS.admin_studies.studies).toBe(true);
    expect(ADMIN_PERMISSIONS.admin_studies.insights).toBe(false);
    expect(ADMIN_PERMISSIONS.admin_studies.reports).toBe(false);
    expect(ADMIN_PERMISSIONS.admin_studies.users).toBe(false);
  });

  it("should grant admin_insights only insights permission", () => {
    expect(ADMIN_PERMISSIONS.admin_insights.insights).toBe(true);
    expect(ADMIN_PERMISSIONS.admin_insights.studies).toBe(false);
    expect(ADMIN_PERMISSIONS.admin_insights.reports).toBe(false);
  });

  it("should grant admin_reports only reports permission", () => {
    expect(ADMIN_PERMISSIONS.admin_reports.reports).toBe(true);
    expect(ADMIN_PERMISSIONS.admin_reports.studies).toBe(false);
    expect(ADMIN_PERMISSIONS.admin_reports.insights).toBe(false);
  });

  it("should have exactly 5 roles defined", () => {
    expect(Object.keys(ADMIN_PERMISSIONS)).toHaveLength(5);
  });
});

// -----------------------------------------------------------------------------
// hasAdminPermission()
// -----------------------------------------------------------------------------

describe("hasAdminPermission", () => {
  it("should return true for super_admin on any permission", () => {
    expect(hasAdminPermission("super_admin", "studies")).toBe(true);
    expect(hasAdminPermission("super_admin", "insights")).toBe(true);
    expect(hasAdminPermission("super_admin", "reports")).toBe(true);
    expect(hasAdminPermission("super_admin", "users")).toBe(true);
  });

  it("should return false for admin_studies on insights", () => {
    expect(hasAdminPermission("admin_studies", "insights")).toBe(false);
  });

  it("should return true for admin_studies on studies", () => {
    expect(hasAdminPermission("admin_studies", "studies")).toBe(true);
  });

  it("should default to super_admin when role is null", () => {
    expect(hasAdminPermission(null, "users")).toBe(true);
  });

  it("should default to super_admin when role is undefined", () => {
    expect(hasAdminPermission(undefined, "studies")).toBe(true);
  });

  it("should default to super_admin when role is empty string", () => {
    expect(hasAdminPermission("", "reports")).toBe(true);
  });

  it("should return false for unknown role (falls through to ??)", () => {
    expect(hasAdminPermission("nonexistent_role", "users")).toBe(false);
  });

  it("should correctly check each role-permission combination", () => {
    const roles: AdminRole[] = [
      "super_admin",
      "admin_content",
      "admin_studies",
      "admin_insights",
      "admin_reports",
    ];
    const permissions = ["studies", "insights", "reports", "users"] as const;

    for (const role of roles) {
      for (const perm of permissions) {
        expect(hasAdminPermission(role, perm)).toBe(
          ADMIN_PERMISSIONS[role][perm]
        );
      }
    }
  });
});

// -----------------------------------------------------------------------------
// ADMIN_ROLES (extended metadata)
// -----------------------------------------------------------------------------

describe("ADMIN_ROLES", () => {
  it("should have 5 role entries", () => {
    expect(ADMIN_ROLES).toHaveLength(5);
  });

  it("should have consistent codes with ADMIN_PERMISSIONS keys", () => {
    const permissionKeys = Object.keys(ADMIN_PERMISSIONS).sort();
    const roleCodes = ADMIN_ROLES.map((r) => r.code).sort();
    expect(roleCodes).toEqual(permissionKeys);
  });

  it("should have label, description, color, and permissions for each role", () => {
    for (const role of ADMIN_ROLES) {
      expect(role.code).toBeTruthy();
      expect(role.label).toBeTruthy();
      expect(role.description).toBeTruthy();
      expect(role.color).toBeTruthy();
      expect(role.permissions).toBeDefined();
    }
  });

  it("should have permissions matching ADMIN_PERMISSIONS", () => {
    for (const role of ADMIN_ROLES) {
      expect(role.permissions).toEqual(ADMIN_PERMISSIONS[role.code]);
    }
  });
});

// -----------------------------------------------------------------------------
// PLAN_BADGES
// -----------------------------------------------------------------------------

describe("PLAN_BADGES", () => {
  it("should define badges for basic, professionnel, entreprise", () => {
    expect(PLAN_BADGES).toHaveProperty("basic");
    expect(PLAN_BADGES).toHaveProperty("professionnel");
    expect(PLAN_BADGES).toHaveProperty("entreprise");
  });

  it("should have bg, text, and label for each plan", () => {
    for (const plan of Object.values(PLAN_BADGES)) {
      expect(plan.bg).toBeTruthy();
      expect(plan.text).toBeTruthy();
      expect(plan.label).toBeTruthy();
    }
  });

  it("should have correct labels", () => {
    expect(PLAN_BADGES.basic.label).toBe("Basic");
    expect(PLAN_BADGES.professionnel.label).toBe("Professionnel");
    expect(PLAN_BADGES.entreprise.label).toBe("Entreprise");
  });
});

// -----------------------------------------------------------------------------
// PLAN_DETAILS
// -----------------------------------------------------------------------------

describe("PLAN_DETAILS", () => {
  it("should define details for all 3 plans", () => {
    expect(Object.keys(PLAN_DETAILS)).toHaveLength(3);
  });

  it("should have name, price, color for each plan", () => {
    for (const plan of Object.values(PLAN_DETAILS)) {
      expect(plan.name).toBeTruthy();
      expect(plan.price).toBeTruthy();
      expect(plan.color).toBeTruthy();
    }
  });

  it("should show basic as free", () => {
    expect(PLAN_DETAILS.basic.price).toBe("Gratuit");
  });

  it("should show professionnel price in CFA", () => {
    expect(PLAN_DETAILS.professionnel.price).toContain("CFA");
  });
});

// -----------------------------------------------------------------------------
// TOKEN_LABELS
// -----------------------------------------------------------------------------

describe("TOKEN_LABELS", () => {
  it("should have 4 token types", () => {
    expect(Object.keys(TOKEN_LABELS)).toHaveLength(4);
  });

  it("should define reports_downloads, insights_access, studies_participation, api_requests", () => {
    expect(TOKEN_LABELS).toHaveProperty("reports_downloads");
    expect(TOKEN_LABELS).toHaveProperty("insights_access");
    expect(TOKEN_LABELS).toHaveProperty("studies_participation");
    expect(TOKEN_LABELS).toHaveProperty("api_requests");
  });

  it("should have label and icon for each token type", () => {
    for (const token of Object.values(TOKEN_LABELS)) {
      expect(token.label).toBeTruthy();
      expect(token.icon).toBeTruthy();
    }
  });
});
