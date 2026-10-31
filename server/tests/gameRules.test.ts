import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  xpForLevel,
  DIFFICULTY_WEIGHTS,
  MISSION_XP_REWARDS,
  xpProgressInCurrentLevel,
} from '@leetquest/shared';

describe('gameRules', () => {
  it('correctly defines difficulty weights', () => {
    expect(DIFFICULTY_WEIGHTS.Easy).toBe(1);
    expect(DIFFICULTY_WEIGHTS.Medium).toBe(2);
    expect(DIFFICULTY_WEIGHTS.Hard).toBe(3);
  });

  it('correctly calculates level = floor(sqrt(xp / 100)) + 1', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(399)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
    expect(calculateLevel(900)).toBe(4);
    expect(calculateLevel(10000)).toBe(11);
  });

  it('calculates base XP required for each level', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(400);
    expect(xpForLevel(4)).toBe(900);
  });

  it('calculates level progress percentage', () => {
    const p1 = xpProgressInCurrentLevel(50);
    expect(p1.currentLevel).toBe(1);
    expect(p1.percentage).toBe(50);

    const p2 = xpProgressInCurrentLevel(250);
    expect(p2.currentLevel).toBe(2);
    // Level 2 is from 100 to 400 (range 300). 250 is 150/300 = 50%
    expect(p2.percentage).toBe(50);
  });

  it('has correct mission XP rewards', () => {
    expect(MISSION_XP_REWARDS['Array Warrior']).toBe(100);
    expect(MISSION_XP_REWARDS['String Master']).toBe(70);
    expect(MISSION_XP_REWARDS['Tree Explorer']).toBe(70);
    expect(MISSION_XP_REWARDS['DP Boss']).toBe(100);
  });
});
