"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Trash2,
  Loader2,
  X,
  User,
  Mail,
  Crown,
  Building,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TeamMember {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

interface TeamData {
  owner: {
    id: number;
    email: string;
    full_name: string;
  };
  team_members: TeamMember[];
  max_members: number;
  current_count: number;
}

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// -----------------------------------------------------------------------------
// Delete Modal
// -----------------------------------------------------------------------------

function DeleteMemberModal({
  memberName,
  actionLoading,
  onClose,
  onConfirm,
}: {
  memberName: string;
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    const firstFocusable = modalRef.current?.querySelector("button") as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const handleTabTrap = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusableEls = modalRef.current?.querySelectorAll(
      "button:not([disabled])"
    ) as NodeListOf<HTMLElement>;
    if (!focusableEls || focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-member-modal-title"
        className="bg-white rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabTrap}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-danger-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-6 w-6 text-danger-600" aria-hidden="true" />
          </div>
          <h2
            id="delete-member-modal-title"
            className="text-lg font-semibold text-surface-900 mb-2"
          >
            Retirer ce membre ?
          </h2>
          <p className="text-surface-500 text-sm mb-1">
            Êtes-vous sûr de vouloir retirer <strong className="text-surface-700">{memberName}</strong> de votre équipe ?
          </p>
          <p className="text-xs text-surface-400 mb-6">
            Cette personne n&apos;aura plus accès au plan Entreprise.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={actionLoading}
              onClick={onConfirm}
            >
              Retirer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function EntrepriseTeamPage() {
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
  });

  useEffect(() => {
    checkAccessAndFetchTeam();
  }, []);

  const checkAccessAndFetchTeam = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (!session.authenticated || !session.user) {
        router.push("/login");
        return;
      }

      const parsedUser = session.user;
      if (parsedUser.plan !== "entreprise" || parsedUser.parent_user_id) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    fetchTeam();
  };

  const fetchTeam = async () => {
    try {
      const response = await fetch("/api/proxy/api/enterprise/team");

      if (response.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Erreur chargement");

      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch("/api/proxy/api/enterprise/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'ajout");
      }

      setSuccess(
        `${formData.full_name} a été ajouté(e) à votre équipe. Un email lui a été envoyé.`
      );
      setShowAddModal(false);
      setFormData({ email: "", full_name: "" });
      fetchTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/proxy/api/enterprise/team/${selectedMember.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Erreur suppression");
      }

      setSuccess(`${selectedMember.full_name} a été retiré(e) de votre équipe.`);
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const remainingSlots = teamData
    ? teamData.max_members - teamData.current_count
    : 0;

  // Loading
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  // Access denied
  if (accessDenied) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-xl bg-accent-50 w-fit mx-auto mb-6" aria-hidden="true">
            <Building className="h-8 w-8 text-accent-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-surface-900 mb-2 tracking-tight">
            Fonctionnalité Entreprise
          </h1>
          <p className="text-surface-500 mb-6 leading-relaxed">
            La gestion d&apos;équipe est réservée aux abonnés du forfait Entreprise.
            Passez au plan Entreprise pour ajouter jusqu&apos;à 5 utilisateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="secondary">Retour au dashboard</Button>
            </Link>
            <a href="https://afrikalytics.com/premium">
              <Button variant="primary">Voir le plan Entreprise</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumb items={[{ label: "Mon Équipe" }]} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Mon Équipe
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {teamData?.current_count || 1} / {teamData?.max_members || 5} membres
          </p>
        </div>
        {remainingSlots > 0 && (
          <Button
            variant="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setError("");
              setSuccess("");
              setShowAddModal(true);
            }}
          >
            <span className="hidden sm:inline">Ajouter un membre</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        )}
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-xl text-sm"
          role="status"
        >
          <CheckCircle className="h-5 w-5 shrink-0" />
          {success}
        </motion.div>
      )}

      {/* Progress Bar */}
      <Card>
        <ProgressBar
          value={teamData?.current_count || 1}
          max={teamData?.max_members || 5}
          variant="accent"
          size="md"
          label="Places utilisées"
          showValue
        />
        <p className="text-xs text-surface-400 mt-2">
          {remainingSlots} place{remainingSlots > 1 ? "s" : ""} restante{remainingSlots > 1 ? "s" : ""}
        </p>
      </Card>

      {/* Owner Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card variant="bordered">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-accent-50 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
              <Crown className="h-5 w-5 text-accent-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-surface-900">{teamData?.owner.full_name}</p>
                <Badge variant="accent" size="sm">Propriétaire</Badge>
              </div>
              <p className="text-sm text-surface-500 truncate">{teamData?.owner.email}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Team Members */}
      {teamData?.team_members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Aucun membre dans votre équipe"
          action={
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(true)}
            >
              Ajouter votre premier membre
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {teamData?.team_members.map((member) => (
            <motion.div key={member.id} variants={itemVariants}>
              <Card variant="bordered">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 bg-primary-50 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-surface-900">{member.full_name}</p>
                        <Badge
                          variant={member.is_active ? "success" : "danger"}
                          size="sm"
                          dot
                        >
                          {member.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-500 truncate">{member.email}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        Ajouté le{" "}
                        {new Date(member.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal(member)}
                    className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all shrink-0"
                    title="Retirer de l'équipe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <Card variant="bordered" className="border-l-4 border-l-primary-500">
        <h3 className="font-semibold text-surface-900 mb-2 text-sm">Comment ça marche ?</h3>
        <ul className="text-sm text-surface-500 space-y-1.5">
          <li>Chaque membre reçoit un email avec ses identifiants</li>
          <li>Tous les membres ont accès au plan Entreprise</li>
          <li>Vous pouvez ajouter jusqu&apos;à 4 membres (5 utilisateurs au total)</li>
          <li>Retirer un membre libère une place dans votre équipe</li>
        </ul>
      </Card>

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md shadow-xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-100">
              <h2 className="text-base font-semibold text-surface-900">Ajouter un membre</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: "", full_name: "" });
                  setError("");
                }}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-surface-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && (
                <div className="bg-danger-50 text-danger-600 px-4 py-2 rounded-lg text-sm border border-danger-200">
                  {error}
                </div>
              )}
              <Input
                label="Nom complet"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                icon={<User className="h-4 w-4" />}
                placeholder="Jean Dupont"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                icon={<Mail className="h-4 w-4" />}
                placeholder="email@entreprise.com"
              />
              <p className="text-xs text-surface-400">
                Un email sera envoyé avec un mot de passe temporaire.
              </p>
            </div>
            <div className="flex gap-3 p-5 border-t border-surface-100">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: "", full_name: "" });
                  setError("");
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={actionLoading}
                disabled={!formData.email || !formData.full_name}
                onClick={handleAddMember}
              >
                Ajouter
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Supprimer */}
      {showDeleteModal && selectedMember && (
        <DeleteMemberModal
          memberName={selectedMember.full_name}
          actionLoading={actionLoading}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleDeleteMember}
        />
      )}
    </div>
  );
}
