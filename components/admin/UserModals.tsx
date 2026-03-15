"use client";

import {
  Shield,
  Trash2,
  FileText,
  Lightbulb,
  Download,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_ROLES } from "@/lib/constants";
import type { User } from "@/lib/types";
import {
  Button,
  Modal,
  Input,
  Select,
} from "@/components/ui";

// =============================================================================
// UserModals — Extracted for code splitting via next/dynamic
// =============================================================================
// These modals are only shown on user interaction (click), making them
// ideal candidates for lazy loading with ssr: false.
// =============================================================================

// Icon mapping for admin roles
const ROLE_ICONS: Record<string, LucideIcon> = {
  super_admin: Crown,
  admin_content: FileText,
  admin_studies: FileText,
  admin_insights: Lightbulb,
  admin_reports: Download,
};

interface FormData {
  email: string;
  full_name: string;
  password: string;
  plan: string;
  is_active: boolean;
  is_admin: boolean;
  admin_role: string;
}

interface UserModalsProps {
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (v: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (v: boolean) => void;
  selectedUser: User | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  handleUpdateUser: (e: React.FormEvent) => void;
  handleDeleteUser: () => void;
}

function AdminRoleSelector({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
}) {
  return (
    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4">
      <p className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-1.5">
        <Shield className="w-4 h-4" aria-hidden="true" />
        Rôle Administrateur
      </p>
      <div className="space-y-2">
        {ADMIN_ROLES.map((role) => {
          const RoleIcon = ROLE_ICONS[role.code] || FileText;
          return (
            <label
              key={role.code}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.admin_role === role.code
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <input
                type="radio"
                name="admin_role"
                value={role.code}
                checked={formData.admin_role === role.code}
                onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                className="w-4 h-4 text-primary-600"
              />
              <RoleIcon className="w-4 h-4 text-surface-500 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{role.label}</p>
                <p className="text-xs text-surface-400">{role.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {role.permissions.studies && (
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-2xs rounded font-semibold">É</span>
                )}
                {role.permissions.insights && (
                  <span className="px-1.5 py-0.5 bg-warning-100 text-warning-700 text-2xs rounded font-semibold">I</span>
                )}
                {role.permissions.reports && (
                  <span className="px-1.5 py-0.5 bg-success-100 text-success-700 text-2xs rounded font-semibold">R</span>
                )}
                {role.permissions.users && (
                  <span className="px-1.5 py-0.5 bg-danger-100 text-danger-700 text-2xs rounded font-semibold">U</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-2xs text-surface-400 mt-2 tracking-wide">
        É = Études, I = Insights, R = Rapports, U = Utilisateurs
      </p>
    </div>
  );
}

export default function UserModals({
  showCreateModal,
  setShowCreateModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  selectedUser,
  formData,
  setFormData,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
}: UserModalsProps) {
  return (
    <>
      {/* Modal Créer */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Utilisateur"
        description="Créez un nouveau compte utilisateur"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={(e) => handleCreateUser(e as unknown as React.FormEvent)}>
              Créer
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nom complet"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helper="Laisser vide pour générer automatiquement"
            placeholder="Généré automatiquement si vide"
          />

          <Select
            label="Plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            options={[
              { value: "basic", label: "Basic" },
              { value: "professionnel", label: "Professionnel" },
              { value: "entreprise", label: "Entreprise" },
            ]}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Actif</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Administrateur</span>
            </label>
          </div>

          {formData.is_admin && <AdminRoleSelector formData={formData} setFormData={setFormData} />}
        </form>
      </Modal>

      {/* Modal Modifier */}
      <Modal
        open={showEditModal && !!selectedUser}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'Utilisateur"
        description={selectedUser?.full_name}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={(e) => handleUpdateUser(e as unknown as React.FormEvent)}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label="Nom complet"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helper="Laisser vide pour conserver le mot de passe actuel"
            placeholder="Laisser vide pour conserver"
          />

          <Select
            label="Plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            options={[
              { value: "basic", label: "Basic" },
              { value: "professionnel", label: "Professionnel" },
              { value: "entreprise", label: "Entreprise" },
            ]}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Actif</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Administrateur</span>
            </label>
          </div>

          {formData.is_admin && <AdminRoleSelector formData={formData} setFormData={setFormData} />}
        </form>
      </Modal>

      {/* Modal Supprimer */}
      <Modal
        open={showDeleteModal && !!selectedUser}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'utilisateur ?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger-600" aria-hidden="true" />
          </div>
          <p className="text-surface-600">
            Êtes-vous sûr de vouloir supprimer <strong className="text-surface-900">{selectedUser?.full_name}</strong> ?
            Cette action est irréversible.
          </p>
        </div>
      </Modal>
    </>
  );
}
