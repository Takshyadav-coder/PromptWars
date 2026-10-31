import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@leetquest/shared';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'leetquest_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setProfile(data.profile);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Login failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { error: msg };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Registration failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { error: msg };
    }
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
