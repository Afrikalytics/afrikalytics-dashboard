'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { api, ApiRequestError } from '@/lib/api';
import type { TeamData, TeamMember, AddMemberFormData } from './types';

interface UseTeamManagementReturn {
  readonly user: ReturnType<typeof useAuthContext>['user'];
  readonly teamData: TeamData | null;
  readonly loading: boolean;
  readonly accessDenied: boolean;
  readonly showAddModal: boolean;
  readonly showDeleteModal: boolean;
  readonly selectedMember: TeamMember | null;
  readonly actionLoading: boolean;
  readonly error: string;
  readonly success: string;
  readonly formData: AddMemberFormData;
  readonly remainingSlots: number;
  readonly setShowAddModal: (show: boolean) => void;
  readonly setFormData: (data: AddMemberFormData) => void;
  readonly setError: (error: string) => void;
  readonly setSuccess: (success: string) => void;
  readonly handleAddMember: () => Promise<void>;
  readonly handleDeleteMember: () => Promise<void>;
  readonly openDeleteModal: (member: TeamMember) => void;
  readonly closeDeleteModal: () => void;
  readonly closeAddModal: () => void;
  readonly openAddModal: () => void;
}

export function useTeamManagement(): UseTeamManagementReturn {
  const { user, isLoading: authLoading } = useAuthContext();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<AddMemberFormData>({
    email: '',
    full_name: '',
  });

  const fetchTeam = useCallback(async () => {
    try {
      const data = await api.get<TeamData>('/api/enterprise/team');
      setTeamData(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.plan !== 'entreprise' || user.parent_user_id) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    fetchTeam();
  }, [authLoading, user, fetchTeam]);

  const openAddModal = useCallback(() => {
    setError('');
    setSuccess('');
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setFormData({ email: '', full_name: '' });
    setError('');
  }, []);

  const handleAddMember = useCallback(async () => {
    setActionLoading(true);
    setError('');

    try {
      await api.post('/api/enterprise/team/add', formData);
      setSuccess(
        `${formData.full_name} a été ajouté(e) à votre équipe. Un email lui a été envoyé.`,
      );
      setShowAddModal(false);
      setFormData({ email: '', full_name: '' });
      fetchTeam();
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestError
          ? err.detail
          : err instanceof Error
            ? err.message
            : 'Une erreur est survenue';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }, [formData, fetchTeam]);

  const openDeleteModal = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedMember(null);
  }, []);

  const handleDeleteMember = useCallback(async () => {
    if (!selectedMember) return;
    setActionLoading(true);

    try {
      await api.delete(`/api/enterprise/team/${selectedMember.id}`);
      setSuccess(`${selectedMember.full_name} a été retiré(e) de votre équipe.`);
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestError
          ? err.detail
          : err instanceof Error
            ? err.message
            : 'Une erreur est survenue';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }, [selectedMember, fetchTeam]);

  const remainingSlots = teamData ? teamData.max_members - teamData.current_count : 0;

  return {
    user,
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
    setShowAddModal,
    setFormData,
    setError,
    setSuccess,
    handleAddMember,
    handleDeleteMember,
    openDeleteModal,
    closeDeleteModal,
    closeAddModal,
    openAddModal,
  };
}
