"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Crown,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { PLAN_DETAILS, ROUTES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/proxy/api/users/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors du changement de mot de passe");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPlanDetails = (plan: string) => {
    const details = PLAN_DETAILS[plan];
    if (plan === "professionnel" || plan === "entreprise") {
      return {
        name: details?.name || plan,
        price: details?.price || "",
        color: details?.color || "bg-gray-100 text-gray-700",
        icon: Crown,
      };
    }
    return {
      name: details?.name || "Basic",
      price: details?.price || "Gratuit",
      color: details?.color || "bg-gray-100 text-gray-700",
      icon: UserIcon,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="h-8 w-8 animate-spin text-surface-400"
          role="status"
          aria-label="Chargement du profil"
        />
      </div>
    );
  }

  if (!user) return null;

  const planDetails = getPlanDetails(user.plan);
  const isPremium = user.plan === "professionnel" || user.plan === "entreprise";

  return (
    <div className="page-container max-w-2xl mx-auto space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumb items={[{ label: "Profil" }]} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Profile Header ── */}
        <motion.div variants={itemVariants}>
          <Card padding="none" className="overflow-hidden">
            <div className="bg-surface-900 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center" aria-hidden="true">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
                    {user.full_name}
                  </h1>
                  <p className="text-surface-400 text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-0 divide-y divide-surface-100">
              {/* Plan */}
              <div className="flex items-center justify-between py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <planDetails.icon className="h-4 w-4 text-surface-400" aria-hidden="true" />
                  <span className="text-sm text-surface-500">Plan</span>
                </div>
                <Badge
                  variant={isPremium ? "primary" : "default"}
                  size="md"
                >
                  {planDetails.name}
                </Badge>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-surface-400" aria-hidden="true" />
                  <span className="text-sm text-surface-500">Email</span>
                </div>
                <span className="text-sm text-surface-900">{user.email}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-surface-400" aria-hidden="true" />
                  <span className="text-sm text-surface-500">Statut</span>
                </div>
                <Badge variant="success" size="sm" dot>
                  Actif
                </Badge>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between py-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-surface-400" aria-hidden="true" />
                  <span className="text-sm text-surface-500">Membre depuis</span>
                </div>
                <span className="text-sm text-surface-900">
                  {new Date(user.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Upgrade CTA */}
            {!isPremium && (
              <div className="px-6 py-4 border-t border-surface-100 bg-surface-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-surface-900 text-sm">Passez à Premium</p>
                    <p className="text-xs text-surface-500">
                      Accédez aux résultats, insights complets et rapports
                    </p>
                  </div>
                  <a href={ROUTES.PREMIUM}>
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}
                    >
                      Voir les offres
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Password Change ── */}
        <motion.div variants={itemVariants}>
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-surface-400" aria-hidden="true" />
                <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                  Changer le mot de passe
                </h2>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  aria-live="polite"
                  className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Mot de passe modifié avec succès ! Un email de confirmation a été envoyé.
                </div>
              )}

              <Input
                label="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
                helper="Minimum 8 caractères"
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={passwordLoading}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                icon={<Lock className="h-4 w-4" />}
              >
                Changer le mot de passe
              </Button>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
