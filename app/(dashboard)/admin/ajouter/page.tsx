"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import { Breadcrumb, Button, Card, Input, Textarea, Select, Alert } from "@/components/ui";
import { CATEGORIES, ICONS, pageVariants, sectionVariants } from "../_constants";

export default function AjouterEtudePage() {
  const router = useRouter();
  useAuth({ requireAdmin: "studies" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

    try {
      await api.post("/api/studies", formData);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl space-y-6"
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Administration", href: "/admin" },
          { label: "Études", href: "/admin" },
          { label: "Nouvelle étude" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href="/admin"
          className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Nouvelle Étude
          </h1>
          <p className="text-surface-500 mt-1">Créez une nouvelle étude de marché</p>
        </div>
      </div>

      {error && <Alert variant="error" title="Erreur">{error}</Alert>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-5">
              Informations de base
            </h2>

            <div className="space-y-5">
              <Input
                label="Titre"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Transformation Digitale en Afrique"
              />

              <Textarea
                label="Description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez l'objectif de cette étude..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Catégorie"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                />

                <Select
                  label="Icône"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  options={ICONS.map((icon) => ({ value: icon.value, label: icon.label }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Durée"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="15-20 min"
                />

                <Input
                  label="Date limite"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="28 Février 2025"
                />

                <Select
                  label="Statut"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: "Ouvert", label: "Ouvert" },
                    { value: "Fermé", label: "Fermé" },
                    { value: "Bientôt", label: "Bientôt" },
                  ]}
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">Visible sur le site public</span>
              </label>
            </div>
          </Card>
        </motion.div>

        {/* URLs QuestionPro */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-5">
              URLs QuestionPro (iframes)
            </h2>

            <div className="space-y-5">
              <Input
                label="URL Sondage Particulier"
                type="url"
                value={formData.embed_url_particulier}
                onChange={(e) => setFormData({ ...formData, embed_url_particulier: e.target.value })}
                placeholder="https://questionpro.com/..."
              />

              <Input
                label="URL Sondage Entreprise"
                type="url"
                value={formData.embed_url_entreprise}
                onChange={(e) => setFormData({ ...formData, embed_url_entreprise: e.target.value })}
                placeholder="https://questionpro.com/..."
              />

              <Input
                label="URL Résultats (Dashboard Premium)"
                type="url"
                value={formData.embed_url_results}
                onChange={(e) => setFormData({ ...formData, embed_url_results: e.target.value })}
                placeholder="https://questionpro.com/..."
              />
            </div>
          </Card>
        </motion.div>

        {/* Buttons */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push("/admin")}
              type="button"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              loading={loading}
              icon={<Save className="h-4 w-4" />}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
