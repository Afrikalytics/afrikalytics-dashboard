"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/constants";
import { saveSession } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";


const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      // Focus the confirm password field on mismatch
      const confirmField = formRef.current?.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
      confirmField?.focus();
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      // Focus the password field
      const passwordField = formRef.current?.querySelector<HTMLInputElement>('input[name="password"]');
      passwordField?.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      await saveSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" role="main" aria-label="Inscription" tabIndex={-1} className="min-h-screen flex">
      {/* Left Panel — Corporate Branding */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="hidden lg:flex lg:w-1/2 relative bg-surface-950 overflow-hidden"
      >
        <div className="relative flex flex-col justify-between px-16 py-16 text-white z-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-white/90" />
            <span className="text-xl font-semibold tracking-tight">
              Afrikalytics<span className="text-warning-500">.</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="max-w-lg">
            <h1 className="font-heading text-4xl xl:text-5xl leading-tight text-balance mb-6 tracking-tight">
              Rejoignez la communauté Afrikalytics
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-md">
              Créez votre compte et accédez à des données exclusives sur les marchés africains.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Inscription gratuite
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Accès immédiat
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel — Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeInUp} className="lg:hidden flex items-center gap-3 mb-12">
            <BarChart3 className="h-6 w-6 text-surface-900" />
            <span className="text-xl font-semibold text-surface-900 tracking-tight">
              Afrikalytics<span className="text-warning-500">.</span>
            </span>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-10">
            <h2 className="text-2xl font-semibold text-surface-900 tracking-tight">
              Créer un compte
            </h2>
            <p className="text-surface-500 mt-2 text-sm">
              Commencez votre exploration des marchés africains
            </p>
          </motion.div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <motion.div variants={fadeInUp}>
                <Alert
                  variant="error"
                  dismissible
                  onDismiss={() => setError("")}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <motion.div variants={fadeInUp}>
              <Input
                label="Nom complet"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Jean Dupont"
                icon={<User className="h-4 w-4" />}
                size="lg"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Adresse email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                icon={<Mail className="h-4 w-4" />}
                size="lg"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                size="lg"
                helper="Minimum 8 caractères"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Input
                label="Confirmer le mot de passe"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                size="lg"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                type="submit"
                loading={loading}
                disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword}
                fullWidth
                size="lg"
                aria-label={loading ? "Création du compte en cours" : "Créer mon compte"}
                iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
              </Button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.p variants={fadeInUp} className="mt-10 text-center text-sm text-surface-400">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-surface-900 hover:text-primary-600 font-medium transition-colors"
            >
              Se connecter
            </Link>
          </motion.p>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <p className="text-xs text-surface-300">
              © 2026 Afrikalytics by Marketym
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
