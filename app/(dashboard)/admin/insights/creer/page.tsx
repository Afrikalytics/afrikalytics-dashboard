"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Lightbulb,
  Image,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import {
  Breadcrumb,
  Button,
  Card,
  Input,
  Textarea,
  Select,
  EmptyState,
  PageSkeleton,
} from "@/components/ui";

interface StudyOption {
  id: number;
  title: string;
  status: string;
}

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35 },
  }),
};

export default function CreerInsightPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ requireAdmin: "insights" });
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
    if (authLoading || !user) return;
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
          // Erreur silencieuse
        }
      }
    };

    fetchClosedStudies();
    return () => controller.abort();
  }, [authLoading, user]);

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
      alert(error instanceof Error ? error.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <PageSkeleton />;
  }

  if (studies.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Administration", href: "/admin" },
            { label: "Insights", href: "/admin/insights" },
            { label: "Nouveau" },
          ]}
        />
        <EmptyState
          icon={<Lightbulb className="h-8 w-8" />}
          title="Aucune étude fermée disponible"
          description="Les insights ne peuvent être créés que pour des études avec le statut « Fermé »."
          action={
            <Button variant="secondary" onClick={() => router.push("/admin/insights")}>
              Retour aux insights
            </Button>
          }
        />
      </div>
    );
  }

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
          { label: "Insights", href: "/admin/insights" },
          { label: "Nouveau" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href="/admin/insights"
          className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Nouvel Insight
          </h1>
          <p className="text-surface-500 mt-1">Créez une analyse pour une étude fermée</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-5">
              Informations de base
            </h2>

            <div className="space-y-5">
              <Select
                label="Étude associée"
                required
                value={String(formData.study_id)}
                onChange={(e) => setFormData({ ...formData, study_id: parseInt(e.target.value) })}
                options={studies.map((study) => ({
                  value: String(study.id),
                  label: study.title,
                }))}
                helper="Seules les études fermées sont disponibles"
              />

              <Input
                label="Titre de l'insight"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: L'IA révolutionne le management en Afrique"
              />

              <Textarea
                label="Résumé exécutif"
                required
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Résumez les principales conclusions de l'étude..."
              />
            </div>
          </Card>
        </motion.div>

        {/* Détails de l'analyse */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-5">
              Analyse détaillée
            </h2>

            <div className="space-y-5">
              <Textarea
                label="Principales découvertes"
                rows={6}
                value={formData.key_findings}
                onChange={(e) => setFormData({ ...formData, key_findings: e.target.value })}
                placeholder={"- 73% des managers utilisent ChatGPT quotidiennement\n- L'IA augmente la productivité de 40% en moyenne\n- Principal frein : manque de formation (68%)"}
                helper="Utilisez des puces pour lister les découvertes clés"
              />

              <Textarea
                label="Recommandations stratégiques"
                rows={6}
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder={"- Investir dans la formation IA pour les équipes\n- Créer une politique d'utilisation de l'IA\n- Commencer par des cas d'usage simples"}
                helper="Proposez des actions concrètes"
              />
            </div>
          </Card>
        </motion.div>

        {/* Images / Graphiques */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                  Images & Graphiques
                </h2>
                <p className="text-sm text-surface-400 mt-0.5">Ajoutez des visuels pour illustrer vos insights</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={addImageField}
                type="button"
              >
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      icon={<Image className="h-4 w-4" />}
                      placeholder="https://exemple.com/graphique.png"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors self-start"
                    aria-label="Supprimer l'image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-surface-400 mt-4">
              Astuce : Hébergez vos images sur{" "}
              <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">ImgBB</a>,{" "}
              <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Cloudinary</a>{" "}
              ou Google Drive (lien public) et collez les URLs ici.
            </p>

            {/* Aperçu des images */}
            {imageUrls.some((url) => url.trim() !== "") && (
              <div className="mt-5 pt-5 border-t border-surface-100">
                <p className="text-sm font-medium text-surface-700 mb-3">Aperçu :</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageUrls
                    .filter((url) => url.trim() !== "")
                    .map((url, index) => (
                      <div key={index} className="relative aspect-video bg-surface-100 rounded-lg overflow-hidden">
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
          </Card>
        </motion.div>

        {/* Publication */}
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="h-4 w-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">
                Publier immédiatement (visible pour les utilisateurs Premium)
              </span>
            </label>
          </Card>
        </motion.div>

        {/* Buttons */}
        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push("/admin/insights")}
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
