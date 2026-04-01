"use client";

import { useState } from "react";
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { useAuthContext } from "@/lib/contexts/AuthContext";

interface ExportButtonProps {
  resourceType: "studies" | "insights" | "reports";
  resourceId: number;
}

const FORMATS = [
  { key: "pdf", label: "PDF", icon: FileText, premium: true },
  { key: "xlsx", label: "Excel", icon: FileSpreadsheet, premium: false },
  { key: "csv", label: "CSV", icon: Table, premium: false },
] as const;

export function ExportButton({ resourceType, resourceId }: ExportButtonProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const isPremium = user?.plan !== "basic";

  const handleExport = async (format: string) => {
    setError("");
    setLoading(format);
    setOpen(false);

    try {
      const response = await fetch(
        `/api/proxy/api/exports/${resourceType}/${resourceId}?format=${format}`,
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiRequestError(
          response.status,
          data?.detail || "Erreur lors de l'export",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `afrikalytics-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.detail : "Erreur lors de l'export",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
      >
        <Download className="h-4 w-4" />
        Exporter
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-surface-200 rounded-lg shadow-lg py-1">
            {FORMATS.map(({ key, label, icon: Icon, premium }) => {
              const disabled = premium && !isPremium;
              const isLoading = loading === key;

              return (
                <button
                  key={key}
                  onClick={() => !disabled && handleExport(key)}
                  disabled={disabled || !!loading}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    disabled
                      ? "text-surface-300 cursor-not-allowed"
                      : "text-surface-700 hover:bg-surface-50"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{label}</span>
                  {disabled && (
                    <span className="ml-auto text-2xs text-surface-400">Pro</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && (
        <p className="absolute right-0 top-full mt-12 text-xs text-danger-600 bg-danger-50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
