// Shared utility functions for admin users page and its components

// Map admin role codes to Badge variants
export function getRoleBadgeVariant(code: string | null): "default" | "primary" | "success" | "warning" | "danger" | "accent" {
  switch (code) {
    case "super_admin": return "danger";
    case "admin_content": return "primary";
    case "admin_studies": return "primary";
    case "admin_insights": return "warning";
    case "admin_reports": return "success";
    default: return "default";
  }
}

// Map plan to Badge variant
export function getPlanBadgeVariant(plan: string): "default" | "primary" | "accent" {
  switch (plan) {
    case "entreprise": return "accent";
    case "professionnel": return "primary";
    default: return "default";
  }
}
