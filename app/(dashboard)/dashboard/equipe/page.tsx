'use client';

import { Loader2 } from 'lucide-react';
import { useTeamManagement } from './components/useTeamManagement';
import { AccessDenied } from './components/AccessDenied';
import { TeamHeader } from './components/TeamHeader';
import { SuccessMessage } from './components/SuccessMessage';
import { TeamProgressCard } from './components/TeamProgressCard';
import { OwnerCard } from './components/OwnerCard';
import { TeamMembersList } from './components/TeamMembersList';
import { TeamInfoBox } from './components/TeamInfoBox';
import { AddMemberModal } from './components/AddMemberModal';
import { DeleteMemberModal } from './components/DeleteMemberModal';

export default function EntrepriseTeamPage() {
  const {
    teamData,
    loading,
    accessDenied,
    showAddModal,
    showDeleteModal,
    selectedMember,
    actionLoading,
    error,
    success,
    formData,
    remainingSlots,
    setFormData,
    handleAddMember,
    handleDeleteMember,
    openDeleteModal,
    closeDeleteModal,
    closeAddModal,
    openAddModal,
  } = useTeamManagement();

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <TeamHeader teamData={teamData} remainingSlots={remainingSlots} onAddClick={openAddModal} />

      {success && <SuccessMessage message={success} />}

      <TeamProgressCard teamData={teamData} remainingSlots={remainingSlots} />

      <OwnerCard teamData={teamData} />

      <TeamMembersList
        members={teamData?.team_members ?? []}
        onDelete={openDeleteModal}
        onAddFirst={() => openAddModal()}
      />

      <TeamInfoBox />

      {showAddModal && (
        <AddMemberModal
          formData={formData}
          error={error}
          actionLoading={actionLoading}
          onFormDataChange={setFormData}
          onClose={closeAddModal}
          onSubmit={handleAddMember}
        />
      )}

      {showDeleteModal && selectedMember && (
        <DeleteMemberModal
          memberName={selectedMember.full_name}
          actionLoading={actionLoading}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteMember}
        />
      )}
    </div>
  );
}
