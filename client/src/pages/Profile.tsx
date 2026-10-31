import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useToast } from '../components/Toast';
import { Shield, Flame, Award, Globe, User } from 'lucide-react';

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { apiFetch } = useApi();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setTimezone(profile.timezone || 'Asia/Kolkata');
      setLeaderboardOptIn(Boolean(profile.leaderboardOptIn));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({
        displayName,
        timezone,
        leaderboardOptIn,
      }),
    });
    setIsSaving(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Profile preferences updated!');
      await refreshProfile();
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Warrior Profile & Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your identity, streak calculation timezone, and privacy settings.
        </p>
      </div>

      {/* Stats Summary Card */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ color: '#c084fc', display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}><Shield size={20} /></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lvl {profile?.level || 1}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level</div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}><Award size={20} /></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.xp || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total XP</div>
          </div>
          <div>
            <div style={{ color: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}><Flame size={20} /></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.currentStreak || 0}d</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Streak</div>
          </div>
          <div>
            <div style={{ color: 'var(--secondary)', display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}><Award size={20} /></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.longestStreak || 0}d</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Longest Streak</div>
          </div>
        </div>
      </Card>

      {/* Preferences Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name" className="form-label">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-tz" className="form-label">
              IANA Timezone (determines daily streak resets)
            </label>
            <select
              id="profile-tz"
              className="form-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={leaderboardOptIn}
                onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Opt in to Public Leaderboard
              </span>
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '1.8rem', marginTop: '0.2rem' }}>
              When enabled, your display name, level, and XP will appear on the Hall of Grandmasters.
            </p>
          </div>

          <Button type="submit" variant="primary" isLoading={isSaving} style={{ width: '100%', marginTop: '1rem' }}>
            Save Profile Settings
          </Button>
        </form>
      </Card>
    </div>
  );
};
