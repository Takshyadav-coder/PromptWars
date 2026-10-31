import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';
import { useMissions } from '../hooks/useMissions';
import { useToast } from '../components/Toast';
import { CURATED_PROBLEMS, CuratedProblem } from '@leetquest/shared';
import { Swords, ExternalLink, CheckCircle2, Shield, Flame, Sparkles } from 'lucide-react';

export const MissionArena: React.FC = () => {
  const { missions, loading, generateMission, completeMission } = useMissions();
  const { showToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const activeMissions = missions.filter((m) => m.status === 'active');
  const completedMissions = missions.filter((m) => m.status === 'completed');

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await generateMission();
    setGenerating(false);

    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('New mission generated based on your topic weakness!');
    }
  };

  const handleComplete = async (id: string, title: string) => {
    setCompletingId(id);
    const res = await completeMission(id);
    setCompletingId(null);

    if (res.error) {
      showToast(res.error, 'error');
    } else if (res.data?.success) {
      showToast(`Quest "${title}" completed! Earned +${res.data.xpAwarded} XP!`, 'success');
    }
  };

  const getSuggestedProblems = (topic: string): CuratedProblem[] => {
    return CURATED_PROBLEMS.filter((p) => p.topic === topic).slice(0, 3);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Swords size={26} color="var(--primary)" />
            <span>Mission Arena</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Conquer tailored DSA quests, solve problems strictly after quest activation, and claim verified XP.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerate}
          isLoading={generating}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Sparkles size={16} />
          <span>Generate Quest</span>
        </Button>
      </div>

      {/* Active Missions Section */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Active Quests ({activeMissions.length})
        </h2>

        {loading && activeMissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Consulting questmasters...</div>
        ) : activeMissions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Shield size={44} color="var(--primary)" />}
              title="No Active Quests"
              description="You have no ongoing missions. Click 'Generate Quest' to generate an objective based on your current weakest DSA topic!"
              actionText="Generate Quest"
              onAction={handleGenerate}
            />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeMissions.map((mission) => {
              const current = mission.currentCount || 0;
              const target = mission.targetCount;
              const isReady = current >= target;
              const suggested = getSuggestedProblems(mission.topic);

              return (
                <Card key={mission.id} glow={isReady}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{mission.title}</h3>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid var(--border-glow)' }}>
                          {mission.topic}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{mission.description}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          +{mission.xpReward} XP
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Active since {new Date(mission.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        variant={isReady ? 'primary' : 'secondary'}
                        onClick={() => handleComplete(mission.id, mission.title)}
                        isLoading={completingId === mission.id}
                        disabled={!isReady}
                        aria-label={`Complete ${mission.title}`}
                      >
                        <CheckCircle2 size={16} />
                        <span>{isReady ? 'Claim XP' : `${current}/${target} Solved`}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <ProgressBar
                      value={current}
                      max={target}
                      showPercent
                      label={`Quest Progress: ${current} of ${target} qualifying ${mission.topic} problems`}
                    />
                  </div>

                  {/* Curated Problem Suggestions */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      Suggested Problems to solve for this quest:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {suggested.map((prob) => (
                        <div
                          key={prob.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{prob.title}</span>
                          <span
                            className={
                              prob.difficulty === 'Easy'
                                ? 'badge-easy'
                                : prob.difficulty === 'Medium'
                                ? 'badge-medium'
                                : 'badge-hard'
                            }
                            style={{ fontSize: '0.7rem' }}
                          >
                            {prob.difficulty}
                          </span>
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.25rem' }}
                            title="Open LeetCode problem in new tab"
                          >
                            <span>Open LeetCode</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Missions Section */}
      {completedMissions.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>
            Completed Bounties ({completedMissions.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {completedMissions.map((m) => (
              <Card key={m.id} style={{ opacity: 0.85, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="var(--easy)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Completed on {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recorded'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--easy)' }}>
                    +{m.xpReward} XP Claimed
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
