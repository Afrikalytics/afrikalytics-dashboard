"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Lightbulb,
  Image,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";

interface StudyOption {
  id: number;
  title: string;
  status: string;
}

export default function CreerInsightPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth({ requireAdmin: "insights" });
  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState<StudyOption[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    study_id: 0,
    title: "",
    summary: "",
    key_findings: "",
    recommendations: "",
    is_published: false,
  });

  useEffect(() => {
    if (authLoading || !token) return;
    const controller = new AbortController();

    const fetchClosedStudies = async () => {
      try {
        const data = await api.get<StudyOption[]>("/api/studies");
        if (controller.signal.aborted) return;
        const closedStudies = data.filter((s) => s.status === "Fermé");
        setStudies(closedStudies);
        if (closedStudies.length > 0) {
          setFormData((prev) => ({ ...prev, study_id: closedStudies[0].id }));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erreur:", error);
        }
      }
    };

    fetchClosedStudies();
    return () => controller.abort();
  }, [authLoading, token]);

  const addImageField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    } else {
      setImageUrls([""]);
    }
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Filtrer les URLs vides
    const validImages = imageUrls.filter((url) => url.trim() !== "");

    try {
      await api.post("/api/insights", {
        ...formData,
        images: validImages.length > 0 ? validImages : null,
      });
      router.push("/admin/insights");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

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
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            Aucune étude fermée disponible
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Les insights ne peuvent être créés que pour des études avec le statut &quot;Fermé&quot;
          </p>
          <a
            href="/admin/insights"
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
      <Sidebar currentPath="/admin/insights" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <a
              href="/admin/insights"
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Nouvel Insight</h1>
              <p className="text-gray-600 mt-1">Créez une analyse pour une étude fermée</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations de base</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Étude associée *
                  </label>
                  <select
                    required
                    value={formData.study_id}
                    onChange={(e) => setFormData({ ...formData, study_id: parseInt(e.target.value) })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de l&apos;insight *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: L'IA révolutionne le management en Afrique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Résumé exécutif *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Résumez les principales conclusions de l'étude..."
                  />
                </div>
              </div>
            </div>

            {/* Détails de l'analyse */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Analyse détaillée</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principales découvertes
                  </label>
                  <textarea
                    rows={6}
                    value={formData.key_findings}
                    onChange={(e) => setFormData({ ...formData, key_findings: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="- 73% des managers utilisent ChatGPT quotidiennement&#10;- L'IA augmente la productivité de 40% en moyenne&#10;- Principal frein : manque de formation (68%)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez des puces pour lister les découvertes clés
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recommandations stratégiques
                  </label>
                  <textarea
                    rows={6}
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="- Investir dans la formation IA pour les équipes&#10;- Créer une politique d'utilisation de l'IA&#10;- Commencer par des cas d'usage simples"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Proposez des actions concrètes
                  </p>
                </div>
              </div>
            </div>

            {/* Images / Graphiques */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Images & Graphiques</h2>
                  <p className="text-sm text-gray-500">Ajoutez des visuels pour illustrer vos insights</p>
                </div>
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une image
                </button>
              </div>
              
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://exemple.com/graphique.png"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                💡 Astuce : Hébergez vos images sur <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ImgBB</a>, <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudinary</a> ou Google Drive (lien public) et collez les URLs ici.
              </p>

              {/* Aperçu des images */}
              {imageUrls.some((url) => url.trim() !== "") && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Aperçu :</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageUrls
                      .filter((url) => url.trim() !== "")
                      .map((url, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Aperçu ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%239ca3af'%3EErreur%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Publication */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700">
                  Publier immédiatement (visible pour les utilisateurs Premium)
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/admin/insights"
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
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
