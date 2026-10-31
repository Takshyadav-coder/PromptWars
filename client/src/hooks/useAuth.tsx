import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { UserProfile } from '@leetquest/shared';

interface AuthUser {
  id: string;
  email: string;
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
    if (isSupabaseConfigured && supabase) {
      // Check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          setToken(session.access_token);
          fetchProfile(session.access_token);
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          setToken(session.access_token);
          fetchProfile(session.access_token);
        } else {
          setUser(null);
          setToken(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Offline/Local Demo Mode
      const storedUser = localStorage.getItem('lq_demo_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setToken(parsed.id);
          fetchProfile(parsed.id);
        } catch {
          localStorage.removeItem('lq_demo_user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      if (data.session) {
        setUser({ id: data.session.user.id, email: data.session.user.email || '' });
        setToken(data.session.access_token);
        await fetchProfile(data.session.access_token);
      }
      return {};
    }

    // Demo login
    const demoUser = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
    };
    localStorage.setItem('lq_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setToken(demoUser.id);
    await fetchProfile(demoUser.id);
    return {};
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      if (error) return { error: error.message };
      if (data.session) {
        setUser({ id: data.session.user.id, email: data.session.user.email || '' });
        setToken(data.session.access_token);
        await fetchProfile(data.session.access_token);
      }
      return {};
    }

    // Demo register
    const demoUser = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
    };
    localStorage.setItem('lq_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setToken(demoUser.id);

    // Create profile
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${demoUser.id}`,
        },
        body: JSON.stringify({ displayName: displayName || email.split('@')[0] }),
      });
    } catch {}

    await fetchProfile(demoUser.id);
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('lq_demo_user');
    setUser(null);
    setToken(null);
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
