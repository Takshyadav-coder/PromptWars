import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Problem, ProblemInput } from '@leetquest/shared';
import { useAuth } from './useAuth';

export function useProblems() {
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    if (!user) {
      setProblems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiFetch<Problem[]>('/api/problems');
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setProblems(res.data);
      setError(null);
    }
    setLoading(false);
  }, [apiFetch, user]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const addProblem = async (input: ProblemInput) => {
    const res = await apiFetch<Problem>('/api/problems', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.data) {
      setProblems((prev) => [res.data!, ...prev]);
    }
    return res;
  };

  const updateProblem = async (id: string, input: Partial<ProblemInput>) => {
    const res = await apiFetch<Problem>(`/api/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    if (res.data) {
      setProblems((prev) => prev.map((p) => (p.id === id ? res.data! : p)));
    }
    return res;
  };

  const deleteProblem = async (id: string) => {
    const res = await apiFetch<{ success: boolean }>(`/api/problems/${id}`, {
      method: 'DELETE',
    });
    if (res.data?.success) {
      setProblems((prev) => prev.filter((p) => p.id !== id));
    }
    return res;
  };

  const importCsv = async (csvContent: string) => {
    const res = await apiFetch<{
      success: boolean;
      insertedCount: number;
      skippedCount: number;
      errors: { line: number; message: string }[];
      problems: Problem[];
    }>('/api/problems/import', {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    });

    if (res.data?.problems) {
      setProblems((prev) => [...res.data!.problems, ...prev]);
    }
    return res;
  };

  return {
    problems,
    loading,
    error,
    refreshProblems: fetchProblems,
    addProblem,
    updateProblem,
    deleteProblem,
    importCsv,
  };
}
