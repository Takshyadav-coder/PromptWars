import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Mission, UserProfile } from '@leetquest/shared';
import { useAuth } from './useAuth';

export function useMissions() {
  const { apiFetch } = useApi();
  const { user, refreshProfile } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiFetch<Mission[]>('/api/missions');
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setMissions(res.data);
      setError(null);
    }
    setLoading(false);
  }, [apiFetch, user]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const generateMission = async () => {
    const res = await apiFetch<Mission>('/api/missions/generate', {
      method: 'POST',
    });
    if (res.data) {
      setMissions((prev) => [res.data!, ...prev]);
    }
    return res;
  };

  const completeMission = async (id: string) => {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      xpAwarded: number;
      profile?: UserProfile;
    }>(`/api/missions/${id}/complete`, {
      method: 'POST',
    });

    if (res.data?.success) {
      await refreshProfile();
      await fetchMissions();
    }

    return res;
  };

  return {
    missions,
    loading,
    error,
    refreshMissions: fetchMissions,
    generateMission,
    completeMission,
  };
}
