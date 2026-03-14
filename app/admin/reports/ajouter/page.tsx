"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Download,
  FileText,
  Crown,
  Users,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";

interface StudyFull {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  deadline: string;
  status: string;
  icon: string;
  embed_url_particulier: string;
  embed_url_entreprise: string;
  embed_url_results: string;
  report_url_basic: string;
  report_url_premium: string;
  is_active: boolean;
}

export default function AjouterReportPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, accessDenied, logout } = useAuth({ requireAdmin: "reports" });
  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState<StudyFull[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<StudyFull | null>(null);
  const [formData, setFormData] = useState({
    report_url_basic: "",
    report_url_premium: "",
  });

  useEffect(() => {
    if (authLoading || !token || accessDenied) return;
    const controller = new AbortController();

    const fetchClosedStudies = async () => {
      try {
        const data = await api.get<StudyFull[]>("/api/studies");
        if (controller.signal.aborted) return;
        const closedStudies = data.filter((s) => s.status === "Fermé");
        setStudies(closedStudies);
        if (closedStudies.length > 0) {
          setSelectedStudy(closedStudies[0]);
          setFormData({
            report_url_basic: closedStudies[0].report_url_basic || "",
            report_url_premium: closedStudies[0].report_url_premium || "",
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erreur:", error);
        }
      }
    };

    fetchClosedStudies();
    return () => controller.abort();
  }, [authLoading, token, accessDenied]);

  const handleStudyChange = (studyId: number) => {
    const study = studies.find((s) => s.id === studyId);
    if (study) {
      setSelectedStudy(study);
      setFormData({
        report_url_basic: study.report_url_basic || "",
        report_url_premium: study.report_url_premium || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) return;

    setLoading(true);

    try {
      // 1. Mettre a jour l'etude avec les URLs des rapports
      await api.put(`/api/studies/${selectedStudy.id}`, {
        title: selectedStudy.title,
        description: selectedStudy.description,
        category: selectedStudy.category,
        duration: selectedStudy.duration,
        deadline: selectedStudy.deadline,
        status: selectedStudy.status,
        icon: selectedStudy.icon,
        embed_url_particulier: selectedStudy.embed_url_particulier,
        embed_url_entreprise: selectedStudy.embed_url_entreprise,
        embed_url_results: selectedStudy.embed_url_results,
        report_url_basic: formData.report_url_basic,
        report_url_premium: formData.report_url_premium,
        is_active: selectedStudy.is_active,
      });

      // 2. Creer les records dans la table reports pour le tracking
      const reportPromises: Promise<unknown>[] = [];

      if (formData.report_url_basic) {
        reportPromises.push(api.post("/api/reports", {
          study_id: selectedStudy.id,
          title: `Rapport Basic - ${selectedStudy.title}`,
          description: "Version résumée du rapport",
          file_url: formData.report_url_basic,
          file_name: "rapport-basic.pdf",
          file_size: "",
          report_type: "basic",
          is_available: true,
        }));
      }

      if (formData.report_url_premium) {
        reportPromises.push(api.post("/api/reports", {
          study_id: selectedStudy.id,
          title: `Rapport Premium - ${selectedStudy.title}`,
          description: "Version complète du rapport",
          file_url: formData.report_url_premium,
          file_name: "rapport-premium.pdf",
          file_size: "",
          report_type: "premium",
          is_available: true,
        }));
      }

      await Promise.all(reportPromises);

      alert("Rapports enregistrés avec succès !");
      router.push("/admin/reports");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  // Access Denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Cette page est réservée aux administrateurs. Vous n&apos;avez pas les permissions nécessaires pour y accéder.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            Aucune étude fermée disponible
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Les rapports ne peuvent être ajoutés que pour des études avec le statut &quot;Fermé&quot;
          </p>
          <a
            href="/admin/reports"
            className="text-blue-600 hover:text-blue-700"
          >
            Retour
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/admin/reports" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <a
              href="/admin/reports"
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gérer les Rapports</h1>
              <p className="text-gray-600 mt-1">Ajoutez les rapports PDF (Basic et Premium) pour une étude</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Important :</strong> Uploadez vos PDFs sur Cloudinary, puis collez les URLs ci-dessous. Les téléchargements seront comptabilisés.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection de l'étude */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sélectionner l&apos;étude</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étude *
                </label>
                <select
                  required
                  value={selectedStudy?.id || 0}
                  onChange={(e) => handleStudyChange(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {studies.map((study) => (
                    <option key={study.id} value={study.id}>
                      {study.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seules les études fermées sont disponibles
                </p>
              </div>
            </div>

            {/* Rapport Basic */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border-l-4 border-gray-400">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                Rapport Basic
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-normal">
                  Gratuit
                </span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Version résumée du rapport, accessible aux utilisateurs Basic (gratuit)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du rapport Basic (PDF)
                </label>
                <input
                  type="url"
                  value={formData.report_url_basic}
                  onChange={(e) => setFormData({ ...formData, report_url_basic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="https://res.cloudinary.com/your-cloud/rapport-basic.pdf"
                />
              </div>
            </div>

            {/* Rapport Premium */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border-l-4 border-yellow-400">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Rapport Premium
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-normal">
                  Professionnel / Entreprise
                </span>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Version complète du rapport, accessible aux utilisateurs Premium (payant)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du rapport Premium (PDF)
                </label>
                <input
                  type="url"
                  value={formData.report_url_premium}
                  onChange={(e) => setFormData({ ...formData, report_url_premium: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="https://res.cloudinary.com/your-cloud/rapport-premium.pdf"
                />
              </div>
            </div>

            {/* Aperçu */}
            {(formData.report_url_basic || formData.report_url_premium) && (
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu des rapports</h3>
                <div className="space-y-2">
                  {formData.report_url_basic && (
                    <a
                      href={formData.report_url_basic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="h-4 w-4" />
                      Voir le rapport Basic
                    </a>
                  )}
                  {formData.report_url_premium && (
                    <a
                      href={formData.report_url_premium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      <Crown className="h-4 w-4" />
                      Voir le rapport Premium
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/admin/reports"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Annuler
              </a>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? "Enregistrement..." : "Enregistrer les rapports"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
