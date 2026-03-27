"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
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
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur de connexion");
      }

      if (data.requires_verification) {
        router.push(`/verify-code?email=${encodeURIComponent(email)}`);
        return;
      }

      await saveSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMsg);
      // Focus first form field on error
      requestAnimationFrame(() => {
        const firstInput = formRef.current?.querySelector<HTMLInputElement>('input');
        firstInput?.focus();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      role="main"
      aria-label="Connexion"
      tabIndex={-1}
      className="min-h-screen flex"
    >
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
              Datatym AI<span className="text-warning-500">.</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="max-w-lg">
            <h1 className="font-heading text-4xl xl:text-5xl leading-tight text-balance mb-6 tracking-tight">
              L&apos;intelligence business au service de l&apos;Afrique
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-md">
              Études de marché, insights exclusifs et rapports détaillés sur l&apos;Afrique francophone.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Données en temps réel
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              14 pays couverts
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
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
              Datatym AI<span className="text-warning-500">.</span>
            </span>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-10">
            <h2 className="text-2xl font-semibold text-surface-900 tracking-tight">
              Connexion
            </h2>
            <p className="text-surface-500 mt-2 text-sm">
              Accédez à votre espace d&apos;analyse
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
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                size="lg"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button
                type="submit"
                loading={loading}
                disabled={!email || !password}
                fullWidth
                size="lg"
                aria-label={loading ? "Connexion en cours" : "Se connecter"}
                iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </motion.div>
          </form>

          {/* Register Link */}
          <motion.p variants={fadeInUp} className="mt-10 text-center text-sm text-surface-400">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-surface-900 hover:text-primary-600 font-medium transition-colors"
              >
                Créer un compte
              </Link>
            </motion.p>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-16 text-center">
            <p className="text-xs text-surface-300">
              © 2026 Datatym AI by Marketym
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
