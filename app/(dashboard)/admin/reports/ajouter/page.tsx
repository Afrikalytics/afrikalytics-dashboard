"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { api } from "@/lib/api";
import {
  Breadcrumb,
  Button,
  Badge,
  Card,
  Input,
  Select,
  Alert,
  EmptyState,
  PageSkeleton,
} from "@/components/ui";

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

export default function AjouterReportPage() {
  const router = useRouter();
  const { token, isLoading: authLoading, accessDenied } = useAuth({ requireAdmin: "reports" });
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
      // 1. Mettre à jour l'étude avec les URLs des rapports
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

      // 2. Créer les records dans la table reports pour le tracking
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
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="bg-danger-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-danger-600" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-surface-900 mb-2">Accès refusé</h1>
          <p className="text-surface-500 mb-6">
            Cette page est réservée aux administrateurs. Vous n&apos;avez pas les permissions nécessaires pour y accéder.
          </p>
          <Button variant="primary" size="lg" onClick={() => window.location.href = "/dashboard"}>
            Retour au dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  if (authLoading) {
    return <PageSkeleton />;
  }

  if (studies.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Administration", href: "/admin" },
            { label: "Rapports", href: "/admin/reports" },
            { label: "Ajouter" },
          ]}
        />
        <EmptyState
          icon={<Download className="h-8 w-8" />}
          title="Aucune étude fermée disponible"
          description="Les rapports ne peuvent être ajoutés que pour des études avec le statut « Fermé »."
          action={
            <Button variant="secondary" onClick={() => router.push("/admin/reports")}>
              Retour aux rapports
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
          { label: "Rapports", href: "/admin/reports" },
          { label: "Ajouter" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href="/admin/reports"
          className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gérer les Rapports
          </h1>
          <p className="text-surface-500 mt-1">Ajoutez les rapports PDF (Basic et Premium) pour une étude</p>
        </div>
      </div>

      {/* Info Box */}
      <Alert variant="info" title="Important">
        Uploadez vos PDFs sur Cloudinary, puis collez les URLs ci-dessous. Les téléchargements seront comptabilisés.
      </Alert>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection de l'étude */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <Card>
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-5">
              Sélectionner l&apos;étude
            </h2>

            <Select
              label="Étude"
              required
              value={String(selectedStudy?.id || 0)}
              onChange={(e) => handleStudyChange(parseInt(e.target.value))}
              options={studies.map((study) => ({
                value: String(study.id),
                label: study.title,
              }))}
              helper="Seules les études fermées sont disponibles"
            />
          </Card>
        </motion.div>

        {/* Rapport Basic */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="border-l-4 border-l-surface-400">
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-surface-500" aria-hidden="true" />
              Rapport Basic
              <Badge variant="default" size="sm">Gratuit</Badge>
            </h2>
            <p className="text-sm text-surface-400 mb-5">
              Version résumée du rapport, accessible aux utilisateurs Basic (gratuit)
            </p>

            <Input
              label="URL du rapport Basic (PDF)"
              type="url"
              value={formData.report_url_basic}
              onChange={(e) => setFormData({ ...formData, report_url_basic: e.target.value })}
              placeholder="https://res.cloudinary.com/your-cloud/rapport-basic.pdf"
            />
          </Card>
        </motion.div>

        {/* Rapport Premium */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="border-l-4 border-l-warning-400">
            <h2 className="text-base font-semibold text-surface-900 tracking-tight mb-1 flex items-center gap-2">
              <Crown className="h-4 w-4 text-warning-600" aria-hidden="true" />
              Rapport Premium
              <Badge variant="warning" size="sm">Pro / Entreprise</Badge>
            </h2>
            <p className="text-sm text-surface-400 mb-5">
              Version complète du rapport, accessible aux utilisateurs Premium (payant)
            </p>

            <Input
              label="URL du rapport Premium (PDF)"
              type="url"
              value={formData.report_url_premium}
              onChange={(e) => setFormData({ ...formData, report_url_premium: e.target.value })}
              placeholder="https://res.cloudinary.com/your-cloud/rapport-premium.pdf"
            />
          </Card>
        </motion.div>

        {/* Aperçu */}
        {(formData.report_url_basic || formData.report_url_premium) && (
          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <Card variant="bordered" className="bg-surface-50">
              <h3 className="text-sm font-medium text-surface-700 mb-3">Aperçu des rapports</h3>
              <div className="space-y-2">
                {formData.report_url_basic && (
                  <a
                    href={formData.report_url_basic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Voir le rapport Basic
                  </a>
                )}
                {formData.report_url_premium && (
                  <a
                    href={formData.report_url_premium}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-warning-600 hover:text-warning-700 transition-colors"
                  >
                    <Crown className="h-4 w-4" aria-hidden="true" />
                    Voir le rapport Premium
                  </a>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push("/admin/reports")}
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
              {loading ? "Enregistrement..." : "Enregistrer les rapports"}
            </Button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
