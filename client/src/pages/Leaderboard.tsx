import React from 'react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Trophy, Medal, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Leaderboard: React.FC = () => {
  const { leaderboard, loading } = useLeaderboard();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-full)', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
          <Trophy size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Hall of Grandmasters</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '480px', margin: '0.25rem auto 0 auto' }}>
          Global leaderboard of opted-in DSA competitors ranked strictly by verified XP.
        </p>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Summoning the rankings...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              icon={<Trophy size={48} color="var(--accent-gold)" />}
              title="No Warriors On The Leaderboard"
              description="Be the first to opt in on your profile page to claim the #1 rank in the arena!"
              actionText="Manage Profile"
              onAction={() => (window.location.href = '/profile')}
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" aria-label="Global Leaderboard">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Warrior</th>
                  <th>Level</th>
                  <th style={{ textAlign: 'right' }}>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={entry.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {rank === 1 ? (
                          <span title="Gold Medal" style={{ color: '#fbbf24', fontSize: '1.2rem' }}>🥇</span>
                        ) : rank === 2 ? (
                          <span title="Silver Medal" style={{ color: '#94a3b8', fontSize: '1.2rem' }}>🥈</span>
                        ) : rank === 3 ? (
                          <span title="Bronze Medal" style={{ color: '#b45309', fontSize: '1.2rem' }}>🥉</span>
                        ) : (
                          `#${rank}`
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{entry.displayName}</span>
                      </td>
                      <td>
                        <span className="level-badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                          <Shield size={12} />
                          Lvl {entry.level}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        {entry.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        Want to appear here? Enable <strong>Leaderboard Visibility</strong> in your{' '}
        <Link to="/profile" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
          Profile Settings
        </Link>.
      </div>
    </div>
  );
};
