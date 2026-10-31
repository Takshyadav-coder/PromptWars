import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { UserStats } from '@leetquest/shared';
import { useAuth } from './useAuth';

export function useStats() {
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiFetch<UserStats>('/api/stats');
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setStats(res.data);
      setError(null);
    }
    setLoading(false);
  }, [apiFetch, user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
}
