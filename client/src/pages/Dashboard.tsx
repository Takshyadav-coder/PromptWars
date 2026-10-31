import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';
import { ChartWrapper } from '../components/ChartWrapper';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../hooks/useAuth';
import { xpProgressInCurrentLevel } from '@leetquest/shared';
import { Flame, Shield, Award, Swords, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { stats, loading, refreshStats } = useStats();
  const navigate = useNavigate();

  const [prevXp, setPrevXp] = useState<number | null>(null);
  const [hasXpIncreased, setHasXpIncreased] = useState(false);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    if (profile) {
      if (prevXp !== null && profile.xp > prevXp) {
        setHasXpIncreased(true);
        const timer = setTimeout(() => setHasXpIncreased(false), 2000);
        return () => clearTimeout(timer);
      }
      setPrevXp(profile.xp);
    }
  }, [profile?.xp]);

  if (loading && !stats) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading hero records...</div>;
  }

  const xpMeta = profile ? xpProgressInCurrentLevel(profile.xp) : null;

  const difficultyData = stats
    ? [
        { name: 'Easy', value: stats.easyCount, color: '#10b981' },
        { name: 'Medium', value: stats.mediumCount, color: '#f59e0b' },
        { name: 'Hard', value: stats.hardCount, color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [];

  const weeklyData = stats?.weeklyProgress.map((w) => ({
    day: w.date.slice(5), // MM-DD
    solved: w.count,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hidden aria-live region to announce XP and Level updates to screen readers */}
      <div className="sr-only" aria-live="polite">
        {hasXpIncreased && profile && `Congratulations! You gained XP. Current XP is now ${profile.xp}, Level ${profile.level}.`}
      </div>

      {/* Header Level & Streak Banner */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7), rgba(17, 24, 39, 0.9))' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {profile?.displayName || 'Adventurer'}
              </h1>
              <span className="level-badge">Lvl {profile?.level || 1}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Total XP:{' '}
              <span
                className={hasXpIncreased ? 'xp-animate' : ''}
                style={{ fontWeight: 700, color: 'var(--accent-gold)' }}
              >
                {profile?.xp || 0}
              </span>{' '}
              XP • Next Level in {xpMeta?.xpRequiredForNext ? xpMeta.xpRequiredForNext - xpMeta.xpInLevel : 100} XP
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
                <Flame size={20} />
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.currentStreak || 0}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Streak</span>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#c084fc' }}>
                <Award size={20} />
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.longestStreak || 0}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Longest Streak</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        {xpMeta && (
          <div style={{ marginTop: '1.5rem' }}>
            <ProgressBar
              value={xpMeta.xpInLevel}
              max={xpMeta.xpRequiredForNext}
              showPercent
              label={`Level ${xpMeta.currentLevel} Progress (${xpMeta.xpInLevel}/${xpMeta.xpRequiredForNext} XP)`}
            />
          </div>
        )}
      </Card>

      {/* Empty State Check */}
      {stats && stats.totalSolved === 0 ? (
        <Card>
          <EmptyState
            icon={<Swords size={48} color="var(--primary)" />}
            title="No Problems Solved Yet"
            description="Your quest log is empty. Add your first LeetCode problem or import a CSV to unlock your stats, identify your weak topics, and generate missions!"
            actionText="+ Log First Problem"
            onAction={() => navigate('/add')}
          />
        </Card>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid-cols-4">
            <Card>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Solved</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats?.totalSolved || 0}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span className="badge-easy">{stats?.easyCount || 0} Easy</span>
                <span className="badge-medium">{stats?.mediumCount || 0} Med</span>
                <span className="badge-hard">{stats?.hardCount || 0} Hard</span>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Strongest Topic</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--easy)', marginTop: '0.25rem' }}>
                {stats?.strongestTopic || 'N/A'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Highest weighted score (Easy=1, Med=2, Hard=3)
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weakest Topic</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>
                {stats?.weakestTopic || 'N/A'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Targeted for your next generated mission
              </div>
            </Card>

            <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
              <Link to="/missions" className="btn btn-primary" style={{ width: '100%' }}>
                <Swords size={16} />
                <span>Mission Arena</span>
              </Link>
              <Link to="/add" className="btn btn-secondary" style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Add Solved Problem</span>
              </Link>
            </Card>
          </div>

          {/* Visual Charts Grid with accessible fallbacks */}
          <div className="grid-cols-2">
            <Card>
              <ChartWrapper
                title="Difficulty Distribution"
                description="Breakdown of problems solved by difficulty"
                fallbackData={[
                  { label: 'Easy', value: stats?.easyCount || 0 },
                  { label: 'Medium', value: stats?.mediumCount || 0 },
                  { label: 'Hard', value: stats?.hardCount || 0 },
                ]}
                fallbackHeaders={['Difficulty', 'Count']}
              >
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={55}
                        paddingAngle={5}
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartWrapper>
            </Card>

            <Card>
              <ChartWrapper
                title="Last 7 Days Activity"
                description="Daily solved problem velocity"
                fallbackData={stats?.weeklyProgress.map((w) => ({ label: w.date, value: w.count })) || []}
                fallbackHeaders={['Date', 'Solved Count']}
              >
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeklyData}>
                      <XAxis dataKey="day" stroke="var(--text-dim)" />
                      <YAxis allowDecimals={false} stroke="var(--text-dim)" />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid var(--border-glow)' }}
                      />
                      <Bar dataKey="solved" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartWrapper>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
