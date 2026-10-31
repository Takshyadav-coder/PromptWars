import { describe, it, expect } from 'vitest';
import { evaluateQuestCompletion } from '../src/questEngine';

describe('questEngine', () => {
  const missionBase = {
    id: 'm1',
    topic: 'Arrays',
    targetCount: 3,
    createdAt: '2026-05-10T10:00:00.000Z',
  };

  it('rejects problems created before or at the exact time of mission creation', () => {
    const problems = [
      { id: 'p1', topic: 'Arrays', createdAt: '2026-05-10T09:59:59.000Z' }, // Before
      { id: 'p2', topic: 'Arrays', createdAt: '2026-05-10T10:00:00.000Z' }, // Exact same time
    ];

    const result = evaluateQuestCompletion(missionBase, problems);
    expect(result.isComplete).toBe(false);
    expect(result.qualifyingCount).toBe(0);
    expect(result.remainingCount).toBe(3);
  });

  it('rejects problems with mismatched topics even if created after mission', () => {
    const problems = [
      { id: 'p1', topic: 'DP', createdAt: '2026-05-10T11:00:00.000Z' },
      { id: 'p2', topic: 'Strings', createdAt: '2026-05-10T12:00:00.000Z' },
    ];

    const result = evaluateQuestCompletion(missionBase, problems);
    expect(result.isComplete).toBe(false);
    expect(result.qualifyingCount).toBe(0);
  });

  it('counts only matching topic problems created strictly after mission creation', () => {
    const problems = [
      { id: 'p1', topic: 'Arrays', createdAt: '2026-05-10T09:00:00.000Z' }, // Ignored (old)
      { id: 'p2', topic: 'DP', createdAt: '2026-05-10T11:00:00.000Z' },     // Ignored (wrong topic)
      { id: 'p3', topic: 'Arrays', createdAt: '2026-05-10T10:00:01.000Z' }, // Qualifying 1
      { id: 'p4', topic: 'Arrays', createdAt: '2026-05-10T12:00:00.000Z' }, // Qualifying 2
    ];

    const result = evaluateQuestCompletion(missionBase, problems);
    expect(result.isComplete).toBe(false);
    expect(result.qualifyingCount).toBe(2);
    expect(result.remainingCount).toBe(1);
    expect(result.qualifyingProblemIds).toEqual(['p3', 'p4']);
  });

  it('marks quest as complete when qualifying count meets or exceeds target', () => {
    const problems = [
      { id: 'p1', topic: 'Arrays', createdAt: '2026-05-10T10:05:00.000Z' },
      { id: 'p2', topic: 'Arrays', createdAt: '2026-05-10T10:10:00.000Z' },
      { id: 'p3', topic: 'Arrays', createdAt: '2026-05-10T10:15:00.000Z' },
      { id: 'p4', topic: 'Arrays', createdAt: '2026-05-10T10:20:00.000Z' },
    ];

    const result = evaluateQuestCompletion(missionBase, problems);
    expect(result.isComplete).toBe(true);
    expect(result.qualifyingCount).toBe(4);
    expect(result.remainingCount).toBe(0);
  });
});
