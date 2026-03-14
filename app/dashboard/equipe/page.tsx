"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
  User,
  Mail,
  Crown,
  Building,
  UserPlus,
  CheckCircle,
} from "lucide-react";

import { API_URL } from "@/lib/constants";

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

function DeleteMemberModal({ memberName, actionLoading, onClose, onConfirm }: { memberName: string; actionLoading: boolean; onClose: () => void; onConfirm: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    const firstFocusable = modalRef.current?.querySelector('button') as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const handleTabTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusableEls = modalRef.current?.querySelectorAll('button:not([disabled])') as NodeListOf<HTMLElement>;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-member-modal-title"
        className="bg-white rounded-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabTrap}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <h2 id="delete-member-modal-title" className="text-xl font-semibold text-gray-900 mb-2">Retirer ce membre ?</h2>
          <p className="text-gray-600 mb-2">
            Êtes-vous sûr de vouloir retirer <strong>{memberName}</strong> de votre équipe ?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Cette personne n&apos;aura plus accès au plan Entreprise.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : "Retirer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
  });

  useEffect(() => {
    checkAccessAndFetchTeam();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const checkAccessAndFetchTeam = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // Vérifier : plan entreprise ET propriétaire (pas de parent_user_id)
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
      const response = await fetch(`${API_URL}/api/enterprise/team`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

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
      const response = await fetch(`${API_URL}/api/enterprise/team/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de l'ajout");
      }

      setSuccess(`${formData.full_name} a été ajouté(e) à votre équipe. Un email lui a été envoyé.`);
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
      const response = await fetch(`${API_URL}/api/enterprise/team/${selectedMember.id}`, {
        method: "DELETE",
        headers: {
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
          Authorization: `Bearer ${getToken()}`,
        },
      });

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

  const remainingSlots = teamData ? teamData.max_members - teamData.current_count : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Écran Accès Refusé
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-purple-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Building className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fonctionnalité Entreprise</h1>
          <p className="text-gray-600 mb-6">
            La gestion d&apos;équipe est réservée aux abonnés du forfait Entreprise. 
            Passez au plan Entreprise pour ajouter jusqu&apos;à 5 utilisateurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Retour au dashboard
            </a>
            <a
              href="https://afrikalytics.com/premium"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Voir le plan Entreprise
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Équipe</h1>
                <p className="text-gray-600">
                  {teamData?.current_count || 1} / {teamData?.max_members || 5} membres
                </p>
              </div>
            </div>
            {remainingSlots > 0 && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowAddModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Ajouter un membre</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Places utilisées</span>
            <span className="text-sm text-gray-500">
              {remainingSlots} place{remainingSlots > 1 ? "s" : ""} restante{remainingSlots > 1 ? "s" : ""}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((teamData?.current_count || 1) / (teamData?.max_members || 5)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Owner Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{teamData?.owner.full_name}</p>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  Propriétaire
                </span>
              </div>
              <p className="text-sm text-gray-500">{teamData?.owner.email}</p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          {teamData?.team_members.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun membre dans votre équipe</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Ajouter votre premier membre
              </button>
            </div>
          ) : (
            teamData?.team_members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{member.full_name}</p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            member.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {member.is_active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ajouté le {new Date(member.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openDeleteModal(member)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Retirer de l'équipe"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Comment ça marche ?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chaque membre reçoit un email avec ses identifiants</li>
            <li>• Tous les membres ont accès au plan Entreprise</li>
            <li>• Vous pouvez ajouter jusqu&apos;à 4 membres (5 utilisateurs au total)</li>
            <li>• Retirer un membre libère une place dans votre équipe</li>
          </ul>
        </div>
      </div>

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Ajouter un membre</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: "", full_name: "" });
                  setError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@entreprise.com"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Un email sera envoyé avec un mot de passe temporaire.
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ email: "", full_name: "" });
                  setError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMember}
                disabled={actionLoading || !formData.email || !formData.full_name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ajouter"}
              </button>
            </div>
          </div>
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
