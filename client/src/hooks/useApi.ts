import { useAuth } from './useAuth';
import { useCallback } from 'react';

export function useApi() {
  const { token } = useAuth();

  const apiFetch = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...((options.headers as Record<string, string>) || {}),
        };

        const res = await fetch(endpoint, {
          ...options,
          headers,
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const errMsg = json?.error || `Request failed with status ${res.status}`;
          return { error: errMsg };
        }

        return { data: json as T };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Network error';
        return { error: message };
      }
    },
    [token]
  );

  return { apiFetch };
}
