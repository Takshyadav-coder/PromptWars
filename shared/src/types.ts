import { Difficulty, Topic } from './constants';

export interface UserProfile {
  id: string;
  displayName: string | null;
  timezone: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  leaderboardOptIn: boolean;
  createdAt: string;
}

export interface Problem {
  id: string;
  userId: string;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  url: string | null;
  solvedDate: string;
  notes: string | null;
  createdAt: string;
}

export interface Mission {
  id: string;
  userId: string;
  templateKey: string;
  title: string;
  description: string;
  topic: Topic;
  targetCount: number;
  xpReward: number;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt: string | null;
  currentCount?: number;
}

export interface TopicProgress {
  topic: Topic;
  easy: number;
  medium: number;
  hard: number;
  total: number;
  weightedScore: number;
}

export interface UserStats {
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topicProgress: TopicProgress[];
  strongestTopic: Topic | null;
  weakestTopic: Topic | null;
  weeklyProgress: { date: string; count: number }[];
}

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  level: number;
  xp: number;
}
