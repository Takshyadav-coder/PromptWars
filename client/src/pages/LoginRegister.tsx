import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

export const LoginRegister: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(email, password, displayName);
        if (res.error) {
          setFormError(res.error);
        } else {
          showToast('Account created! Welcome to LeetQuest.');
          navigate('/dashboard');
        }
      } else {
        const res = await login(email, password);
        if (res.error) {
          setFormError(res.error);
        } else {
          showToast('Welcome back, Quester!');
          navigate('/dashboard');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '2.5rem' }}>⚔️</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {isRegister ? 'Create Your Character' : 'Resume Quest'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Begin your journey to algorithmic mastery' : 'Log in to track your LeetCode progress'}
          </p>
        </div>

        {formError && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-display-name" className="form-label">
                Warrior Name (Display Name)
              </label>
              <input
                id="auth-display-name"
                type="text"
                className="form-input"
                placeholder="e.g. CodeNinja"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="warrior@leetquest.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {isRegister ? 'Register Account' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setFormError(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </Card>
    </div>
  );
};
