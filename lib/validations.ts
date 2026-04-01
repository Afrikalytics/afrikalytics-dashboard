// =============================================================================
// Afrikalytics Dashboard — Zod Validation Schemas
// =============================================================================
// Client-side validation schemas aligned with backend Pydantic schemas.
// Used in forms to validate before API submission.
// =============================================================================

import { z } from "zod";

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide").max(254),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Nom requis").max(100, "Nom trop long"),
    email: z.string().email("Adresse email invalide").max(254),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide").max(254),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Le code doit contenir 6 chiffres").regex(/^\d{6}$/),
});

// -----------------------------------------------------------------------------
// Studies (Admin)
// -----------------------------------------------------------------------------

export const studyCreateSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200),
  description: z.string().min(1, "Description requise").max(5000),
  category: z.string().min(1, "Catégorie requise").max(100),
  duration: z.string().max(50).optional(),
  deadline: z.string().max(50).optional(),
  status: z.enum(["Ouvert", "Ferme", "Bientot"]).default("Ouvert"),
  icon: z.string().max(50).optional(),
  embed_url_particulier: z.string().url("URL invalide").max(2000).or(z.literal("")).optional(),
  embed_url_entreprise: z.string().url("URL invalide").max(2000).or(z.literal("")).optional(),
  embed_url_results: z.string().url("URL invalide").max(2000).or(z.literal("")).optional(),
  is_active: z.boolean().default(true),
});

// -----------------------------------------------------------------------------
// Insights (Admin)
// -----------------------------------------------------------------------------

export const insightCreateSchema = z.object({
  study_id: z.number().int().positive("Étude requise"),
  title: z.string().min(1, "Titre requis").max(200),
  summary: z.string().min(1, "Résumé requis").max(5000),
  content: z.string().max(50000).optional(),
  is_published: z.boolean().default(false),
});

// -----------------------------------------------------------------------------
// Reports (Admin)
// -----------------------------------------------------------------------------

export const reportCreateSchema = z.object({
  study_id: z.number().int().positive("Étude requise"),
  title: z.string().min(1, "Titre requis").max(200),
  description: z.string().max(5000).optional(),
  file_url: z.string().url("URL du fichier invalide").max(2000),
  file_name: z.string().max(300).optional(),
  report_type: z.enum(["basic", "premium"]).default("premium"),
  is_available: z.boolean().default(true),
});

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// -----------------------------------------------------------------------------
// Contact
// -----------------------------------------------------------------------------

export const contactSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(254),
  company: z.string().max(200).optional(),
  message: z.string().min(10, "Message trop court").max(5000),
});

// -----------------------------------------------------------------------------
// Blog (Admin)
// -----------------------------------------------------------------------------

export const blogPostCreateSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  slug: z.string().max(255).optional(),
  excerpt: z.string().max(2000).optional(),
  content: z.string().min(1, "Contenu requis").max(50000),
  category: z.string().max(100).optional(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
});

// -----------------------------------------------------------------------------
// Team (Entreprise)
// -----------------------------------------------------------------------------

export const addTeamMemberSchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(254),
});

// -----------------------------------------------------------------------------
// Type exports (infer from schemas)
// -----------------------------------------------------------------------------

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudyCreateInput = z.infer<typeof studyCreateSchema>;
export type InsightCreateInput = z.infer<typeof insightCreateSchema>;
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
