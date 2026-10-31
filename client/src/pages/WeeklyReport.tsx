import React from 'react';
import { Card } from '../components/Card';
import { ChartWrapper } from '../components/ChartWrapper';
import { useStats } from '../hooks/useStats';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, TrendingUp, CheckCircle, Award } from 'lucide-react';

export const WeeklyReport: React.FC = () => {
  const { stats, loading } = useStats();

  if (loading && !stats) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Compiling weekly chronicles...</div>;
  }

  const weeklyData = stats?.weeklyProgress || [];
  const totalThisWeek = weeklyData.reduce((acc, curr) => acc + curr.count, 0);

  const fallbackData = weeklyData.map((w) => ({
    label: w.date,
    value: `${w.count} problems solved`,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Weekly Performance Brief</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Chronicle of your consistency and problem-solving rhythm over the past 7 days.
        </p>
      </div>

      <div className="grid-cols-4">
        <Card>
          <div style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}><Calendar size={22} /></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Solved This Week</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{totalThisWeek}</div>
        </Card>

        <Card>
          <div style={{ color: 'var(--easy)', marginBottom: '0.4rem' }}><TrendingUp size={22} /></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Average</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {(totalThisWeek / 7).toFixed(1)}
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '0.4rem' }}><Award size={22} /></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Key Strength</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--easy)' }}>
            {stats?.strongestTopic || 'N/A'}
          </div>
        </Card>

        <Card>
          <div style={{ color: '#f87171', marginBottom: '0.4rem' }}><CheckCircle size={22} /></div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recommended Focus</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.2rem', color: '#f87171' }}>
            {stats?.weakestTopic || 'N/A'}
          </div>
        </Card>
      </div>

      <Card>
        <ChartWrapper
          title="Daily Solved Problem Velocity (Last 7 Days)"
          description="Distribution of problems across the current cycle"
          fallbackData={fallbackData}
          fallbackHeaders={['Date', 'Problems Solved']}
        >
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" stroke="var(--text-dim)" />
                <YAxis allowDecimals={false} stroke="var(--text-dim)" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border-glow)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Solved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      </Card>
    </div>
  );
};
