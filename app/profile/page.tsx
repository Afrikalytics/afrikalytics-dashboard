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
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { API_URL, PLAN_DETAILS } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    // Validation
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
          Authorization: `Bearer ${token}`,
        },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" role="status" aria-label="Chargement du profil" />
      </div>
    );
  }

  if (!user) return null;

  const planDetails = getPlanDetails(user.plan);
  const isPremium = user.plan === "professionnel" || user.plan === "entreprise";

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Retour au dashboard
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.full_name}</h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Plan */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <planDetails.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="text-gray-600">Plan</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${planDetails.color}`}>
                {planDetails.name}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="text-gray-600">Email</span>
              </div>
              <span className="text-gray-900">{user.email}</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="text-gray-600">Statut</span>
              </div>
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Actif
              </span>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="text-gray-600">Membre depuis</span>
              </div>
              <span className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Upgrade CTA for Basic users */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Passez à Premium</h3>
                  <p className="text-sm text-gray-600">
                    Accédez aux résultats, insights complets et rapports
                  </p>
                </div>
                <a
                  href="https://afrikalytics.com/premium"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Voir les offres
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              Changer le mot de passe
            </h2>
          </div>

          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            {passwordError && (
              <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                Mot de passe modifié avec succès ! Un email de confirmation a été envoyé.
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby="new-password-hint"
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
              <p id="new-password-hint" className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-required="true"
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              aria-busy={passwordLoading}
              aria-disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Modification en cours...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" aria-hidden="true" />
                  Changer le mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
