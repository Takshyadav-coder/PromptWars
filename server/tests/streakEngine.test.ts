import { describe, it, expect } from 'vitest';
import { calculateStreak, getLocalDateString } from '../src/streakEngine';

describe('streakEngine', () => {
  it('correctly formats local date with timezone', () => {
    // 2026-05-10 20:00 UTC is 2026-05-11 01:30 in Asia/Kolkata (+05:30)
    const testDate = new Date('2026-05-10T20:00:00.000Z');
    const kolkataDate = getLocalDateString(testDate, 'Asia/Kolkata');
    const utcDate = getLocalDateString(testDate, 'UTC');

    expect(kolkataDate).toBe('2026-05-11');
    expect(utcDate).toBe('2026-05-10');
  });

  it('initializes streak to 1 when lastActiveDate is null', () => {
    const completion = new Date('2026-05-10T12:00:00.000Z');
    const result = calculateStreak(
      {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        timezone: 'UTC',
      },
      completion
    );

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActiveDate).toBe('2026-05-10');
    expect(result.streakUpdated).toBe(true);
  });

  it('keeps streak unchanged on same-day completion', () => {
    const completion = new Date('2026-05-10T18:00:00.000Z');
    const result = calculateStreak(
      {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: '2026-05-10',
        timezone: 'UTC',
      },
      completion
    );

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(10);
    expect(result.lastActiveDate).toBe('2026-05-10');
    expect(result.streakUpdated).toBe(false);
  });

  it('increments streak by 1 when completed on the consecutive previous day', () => {
    const completion = new Date('2026-05-11T09:00:00.000Z');
    const result = calculateStreak(
      {
        currentStreak: 4,
        longestStreak: 4,
        lastActiveDate: '2026-05-10',
        timezone: 'UTC',
      },
      completion
    );

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5); // Updates longest streak
    expect(result.lastActiveDate).toBe('2026-05-11');
    expect(result.streakUpdated).toBe(true);
  });

  it('resets streak to 1 when completed after a gap (> 1 day)', () => {
    const completion = new Date('2026-05-15T09:00:00.000Z');
    const result = calculateStreak(
      {
        currentStreak: 7,
        longestStreak: 12,
        lastActiveDate: '2026-05-10',
        timezone: 'UTC',
      },
      completion
    );

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(12); // Preserves previous longest streak
    expect(result.lastActiveDate).toBe('2026-05-15');
    expect(result.streakUpdated).toBe(true);
  });
});
