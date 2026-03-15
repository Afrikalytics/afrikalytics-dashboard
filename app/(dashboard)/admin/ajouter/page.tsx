"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";

// Liste complète des catégories
const CATEGORIES = [
  "RH & Talents",
  "Digital & IA",
  "Finance",
  "Marketing",
  "Technologie",
  "Santé",
  "Éducation",
  "Agriculture",
  "Énergie",
  "Immobilier",
  "Commerce",
  "Logistique",
  "Télécommunications",
  "Banque & Assurance",
  "Industrie",
  "Tourisme",
  "Environnement",
  "Gouvernance",
  "Startups",
  "E-commerce",
  "Transport",
  "Médias",
  "Sport",
  "Culture",
  "Mode & Lifestyle",
  "Alimentation",
  "Sécurité",
  "Juridique",
  "Consulting",
  "Autre",
];

// Liste complète des icônes
const ICONS = [
  { value: "users", label: "👥 Utilisateurs" },
  { value: "trending", label: "📈 Tendances" },
  { value: "chart", label: "📊 Graphique" },
  { value: "file", label: "📄 Document" },
  { value: "business", label: "💼 Business" },
  { value: "finance", label: "💰 Finance" },
  { value: "health", label: "🏥 Santé" },
  { value: "education", label: "🎓 Éducation" },
  { value: "global", label: "🌍 Global" },
  { value: "energy", label: "⚡ Énergie" },
  { value: "building", label: "🏠 Immobilier" },
  { value: "cart", label: "🛒 Commerce" },
  { value: "mobile", label: "📱 Mobile" },
  { value: "lock", label: "🔒 Sécurité" },
  { value: "rocket", label: "🚀 Innovation" },
  { value: "plant", label: "🌱 Agriculture" },
  { value: "factory", label: "🏭 Industrie" },
  { value: "plane", label: "✈️ Transport" },
  { value: "code", label: "💻 Tech" },
  { value: "star", label: "⭐ Premium" },
  { value: "target", label: "🎯 Objectif" },
  { value: "brain", label: "🧠 IA" },
  { value: "handshake", label: "🤝 Partenariat" },
  { value: "megaphone", label: "📢 Marketing" },
  { value: "clipboard", label: "📋 Sondage" },
  { value: "calendar", label: "📅 Événement" },
  { value: "map", label: "🗺️ Géographie" },
  { value: "flag", label: "🚩 Afrique" },
  { value: "lightbulb", label: "💡 Idée" },
  { value: "pie", label: "🥧 Stats" },
];

export default function AjouterEtudePage() {
  const router = useRouter();
  useAuth({ requireAdmin: "studies" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Digital & IA",
    icon: "users",
    duration: "15-20 min",
    deadline: "",
    status: "Ouvert",
    is_active: true,
    embed_url_particulier: "",
    embed_url_entreprise: "",
    embed_url_results: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/studies", formData);
      router.push("/admin");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <a
              href="/admin"
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </a>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Nouvelle Étude</h1>
              <p className="text-gray-600 mt-1">Créez une nouvelle étude de marché</p>
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
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Transformation Digitale en Afrique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Décrivez l'objectif de cette étude..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icône
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="15-20 min"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date limite
                    </label>
                    <input
                      type="text"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="28 Février 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Ouvert">Ouvert</option>
                      <option value="Fermé">Fermé</option>
                      <option value="Bientôt">Bientôt</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Visible sur le site public
                  </label>
                </div>
              </div>
            </div>

            {/* URLs QuestionPro */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">URLs QuestionPro (iframes)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Sondage Particulier
                  </label>
                  <input
                    type="url"
                    value={formData.embed_url_particulier}
                    onChange={(e) => setFormData({ ...formData, embed_url_particulier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://questionpro.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Sondage Entreprise
                  </label>
                  <input
                    type="url"
                    value={formData.embed_url_entreprise}
                    onChange={(e) => setFormData({ ...formData, embed_url_entreprise: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://questionpro.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Résultats (Dashboard Premium)
                  </label>
                  <input
                    type="url"
                    value={formData.embed_url_results}
                    onChange={(e) => setFormData({ ...formData, embed_url_results: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://questionpro.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/admin"
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
  );
}
