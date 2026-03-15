"use client";

import { useState } from "react";
import { API_URL } from "@/lib/constants";

interface SSOButtonsProps {
  mode: "login" | "register";
}

export default function SSOButtons({ mode }: SSOButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleGoogleSSO = async () => {
    setLoadingProvider("google");
    try {
      const response = await fetch(`${API_URL}/api/auth/sso/google`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch {
      setLoadingProvider(null);
    }
  };

  const handleMicrosoftSSO = async () => {
    setLoadingProvider("microsoft");
    try {
      const response = await fetch(`${API_URL}/api/auth/sso/microsoft`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch {
      setLoadingProvider(null);
    }
  };

  const label = mode === "login" ? "Se connecter avec" : "S'inscrire avec";

  return (
    <div className="space-y-3 mt-6">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">ou continuer avec</span>
        </div>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSSO}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${label} Google`}
      >
        {/* Google icon SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {loadingProvider === "google" ? "Redirection..." : "Google"}
        </span>
      </button>

      {/* Microsoft button */}
      <button
        type="button"
        onClick={handleMicrosoftSSO}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${label} Microsoft`}
      >
        {/* Microsoft icon SVG */}
        <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
          <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {loadingProvider === "microsoft" ? "Redirection..." : "Microsoft"}
        </span>
      </button>
    </div>
  );
}
