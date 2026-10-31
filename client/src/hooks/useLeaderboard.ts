import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { LeaderboardEntry } from '@leetquest/shared';

export function useLeaderboard() {
  const { apiFetch } = useApi();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<LeaderboardEntry[]>('/api/leaderboard');
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setLeaderboard(res.data);
      setError(null);
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refreshLeaderboard: fetchLeaderboard,
  };
}
