import { Difficulty } from './constants';

export const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export const MISSION_XP_REWARDS = {
  'Array Warrior': 100,
  'String Master': 70,
  'Tree Explorer': 70,
  'DP Boss': 100,
  array_warrior: 100,
  string_master: 70,
  tree_explorer: 70,
  dp_boss: 100,
} as const;

export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

export function xpProgressInCurrentLevel(xp: number): {
  currentLevel: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  xpInLevel: number;
  xpRequiredForNext: number;
  percentage: number;
} {
  const currentLevel = calculateLevel(xp);
  const currentLevelBaseXp = xpForLevel(currentLevel);
  const nextLevelBaseXp = xpForLevel(currentLevel + 1);
  const xpRequiredForNext = nextLevelBaseXp - currentLevelBaseXp;
  const xpInLevel = Math.max(0, xp - currentLevelBaseXp);
  const percentage = Math.min(100, Math.round((xpInLevel / xpRequiredForNext) * 100));

  return {
    currentLevel,
    currentLevelBaseXp,
    nextLevelBaseXp,
    xpInLevel,
    xpRequiredForNext,
    percentage,
  };
}
