import React from 'react';
import { Card } from '../components/Card';
import { ChartWrapper } from '../components/ChartWrapper';
import { useStats } from '../hooks/useStats';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const TopicAnalysis: React.FC = () => {
  const { stats, loading } = useStats();

  if (loading && !stats) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Analyzing DSA mastery...</div>;
  }

  const topicScores = stats?.topicProgress || [];
  const chartData = topicScores.map((t) => ({
    topic: t.topic,
    score: t.weightedScore,
    total: t.total,
  }));

  const fallbackData = topicScores.map((t) => ({
    label: `${t.topic} (${t.total} solved: ${t.easy}E/${t.medium}M/${t.hard}H)`,
    value: `${t.weightedScore} pts`,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Topic Mastery Analysis</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Evaluate your algorithmic breadth across all 12 core DSA topics with weighted difficulty scoring.
        </p>
      </div>

      <div className="grid-cols-2">
        <Card>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Strongest Domain</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--easy)', marginTop: '0.25rem' }}>
            {stats?.strongestTopic || 'No data yet'}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Your most dominant category by weighted score.
          </p>
        </Card>

        <Card>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Weakest Domain (Quest Target)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>
            {stats?.weakestTopic || 'No data yet'}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Missions are generated automatically targeting this weak category.
          </p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <ChartWrapper
          title="Weighted Topic Score Distribution"
          description="Formula: (Easy × 1) + (Medium × 2) + (Hard × 3)"
          fallbackData={fallbackData}
          fallbackHeaders={['Topic & Breakdown', 'Weighted Score']}
        >
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis dataKey="topic" angle={-30} textAnchor="end" interval={0} stroke="var(--text-dim)" fontSize={12} />
                <YAxis stroke="var(--text-dim)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid var(--border-glow)' }}
                />
                <Bar dataKey="score" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Weighted Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWrapper>
      </Card>

      {/* Detailed Topic Cards */}
      <div className="grid-cols-4">
        {topicScores.map((t) => (
          <Card key={t.topic} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t.topic}</h3>
              <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>{t.weightedScore} pts</span>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem' }}>
              <span className="badge-easy">{t.easy}E</span>
              <span className="badge-medium">{t.medium}M</span>
              <span className="badge-hard">{t.hard}H</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontWeight: 600 }}>Total: {t.total}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
