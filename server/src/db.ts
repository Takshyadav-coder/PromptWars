import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Problem,
  UserProfile,
  Mission,
  TopicProgress,
  UserStats,
  LeaderboardEntry,
  DIFFICULTY_WEIGHTS,
  Topic,
  TOPICS,
  calculateLevel,
} from '@leetquest/shared';
import { calculateStreak } from './streakEngine';
import { evaluateQuestCompletion } from './questEngine';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  profiles: UserProfile[];
  problems: Problem[];
  missions: Mission[];
  xpEvents: { id: string; userId: string; missionId: string; xp: number; createdAt: string }[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'leetquest.json');

class LocalFileDatabase {
  private data: DatabaseSchema = {
    users: [],
    profiles: [],
    problems: [],
    missions: [],
    xpEvents: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not load data file, starting with empty database state', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data to disk', err);
    }
  }

  public reset() {
    this.data = {
      users: [],
      profiles: [],
      problems: [],
      missions: [],
      xpEvents: [],
    };
    this.save();
  }

  // --- Auth / User Operations ---
  public findUserByEmail(email: string): UserAccount | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserAccount | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(email: string, passwordHash: string, displayName: string): UserAccount {
    const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id,
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName || email.split('@')[0],
      createdAt: now,
    };
    this.data.users.push(newUser);

    // Auto-create initial profile
    const newProfile: UserProfile = {
      id,
      displayName: newUser.displayName,
      timezone: 'Asia/Kolkata',
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      leaderboardOptIn: false,
      createdAt: now,
    };
    this.data.profiles.push(newProfile);

    this.save();
    return newUser;
  }

  // --- Profile Operations ---
  public getProfile(userId: string): UserProfile {
    let profile = this.data.profiles.find((p) => p.id === userId);
    if (!profile) {
      profile = {
        id: userId,
        displayName: 'Quester',
        timezone: 'Asia/Kolkata',
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        leaderboardOptIn: false,
        createdAt: new Date().toISOString(),
      };
      this.data.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  public updateProfile(userId: string, data: Partial<UserProfile>): UserProfile {
    const profile = this.getProfile(userId);
    if (data.displayName !== undefined) profile.displayName = data.displayName;
    if (data.timezone !== undefined) profile.timezone = data.timezone;
    if (data.leaderboardOptIn !== undefined) profile.leaderboardOptIn = data.leaderboardOptIn;
    this.save();
    return profile;
  }

  // --- Problem Operations ---
  public listProblems(userId: string): Problem[] {
    return this.data.problems
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createProblem(
    userId: string,
    problem: Omit<Problem, 'id' | 'userId' | 'createdAt'>
  ): { problem?: Problem; error?: string } {
    // Unique index on (user_id, lower(title))
    const exists = this.data.problems.some(
      (p) => p.userId === userId && p.title.toLowerCase() === problem.title.toLowerCase()
    );
    if (exists) {
      return { error: 'A problem with this title already exists in your solved list.' };
    }

    const newProblem: Problem = {
      id: `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: problem.title,
      difficulty: problem.difficulty,
      topic: problem.topic,
      url: problem.url || null,
      solvedDate: problem.solvedDate,
      notes: problem.notes || null,
      createdAt: new Date().toISOString(),
    };

    this.data.problems.push(newProblem);
    this.save();
    return { problem: newProblem };
  }

  public updateProblem(userId: string, id: string, updates: Partial<Problem>): Problem | null {
    const idx = this.data.problems.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return null;

    const existing = this.data.problems[idx];
    const updated = { ...existing, ...updates };
    this.data.problems[idx] = updated;
    this.save();
    return updated;
  }

  public deleteProblem(userId: string, id: string): boolean {
    const idx = this.data.problems.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.data.problems.splice(idx, 1);
    this.save();
    return true;
  }

  public batchInsertProblems(
    userId: string,
    problems: Omit<Problem, 'id' | 'userId' | 'createdAt'>[]
  ): { inserted: Problem[]; skippedCount: number } {
    const existing = this.listProblems(userId);
    const existingTitles = new Set(existing.map((p) => p.title.toLowerCase()));

    const inserted: Problem[] = [];
    let skipped = 0;

    for (const p of problems) {
      const lower = p.title.toLowerCase();
      if (existingTitles.has(lower)) {
        skipped++;
      } else {
        existingTitles.add(lower);
        const res = this.createProblem(userId, p);
        if (res.problem) {
          inserted.push(res.problem);
        } else {
          skipped++;
        }
      }
    }

    return { inserted, skippedCount: skipped };
  }

  // --- Mission Operations ---
  public listMissions(userId: string): Mission[] {
    const userMissions = this.data.missions
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const userProblems = this.listProblems(userId);
    return userMissions.map((m) => {
      const evalResult = evaluateQuestCompletion(m, userProblems);
      return {
        ...m,
        currentCount: evalResult.qualifyingCount,
      };
    });
  }

  public createMission(
    mission: Omit<Mission, 'id' | 'createdAt' | 'completedAt' | 'status'>
  ): Mission {
    const newMission: Mission = {
      id: `msn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: mission.userId,
      templateKey: mission.templateKey,
      title: mission.title,
      description: mission.description,
      topic: mission.topic,
      targetCount: mission.targetCount,
      xpReward: mission.xpReward,
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null,
      currentCount: 0,
    };

    this.data.missions.push(newMission);
    this.save();
    return newMission;
  }

  public completeMission(
    userId: string,
    missionId: string
  ): { success: boolean; reason?: string; xpAwarded?: number; profile?: UserProfile } {
    const mission = this.data.missions.find((m) => m.id === missionId && m.userId === userId);
    if (!mission) {
      return { success: false, reason: 'Mission not found' };
    }

    if (mission.status === 'completed') {
      return { success: false, reason: 'Mission already completed', xpAwarded: 0 };
    }

    // Verify quest completion with questEngine
    const userProblems = this.listProblems(userId);
    const evalResult = evaluateQuestCompletion(mission, userProblems);
    if (!evalResult.isComplete) {
      return {
        success: false,
        reason: `Mission requirements not met. Solved ${evalResult.qualifyingCount}/${evalResult.targetCount} problems.`,
      };
    }

    // Atomic XP event check (unique constraint on missionId)
    const alreadyAwarded = this.data.xpEvents.some((e) => e.missionId === missionId);
    if (alreadyAwarded) {
      return { success: false, reason: 'XP already awarded for this mission', xpAwarded: 0 };
    }

    this.data.xpEvents.push({
      id: `xp_${Date.now()}`,
      userId,
      missionId,
      xp: mission.xpReward,
      createdAt: new Date().toISOString(),
    });

    // Update streak and XP
    const profile = this.getProfile(userId);
    const streakResult = calculateStreak(
      {
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActiveDate: profile.lastActiveDate,
        timezone: profile.timezone,
      },
      new Date()
    );

    profile.xp += mission.xpReward;
    profile.level = calculateLevel(profile.xp);
    profile.currentStreak = streakResult.currentStreak;
    profile.longestStreak = streakResult.longestStreak;
    profile.lastActiveDate = streakResult.lastActiveDate;

    mission.status = 'completed';
    mission.completedAt = new Date().toISOString();

    this.save();

    return {
      success: true,
      xpAwarded: mission.xpReward,
      profile,
    };
  }

  // --- Stats & Leaderboard ---
  public getStats(userId: string): UserStats {
    const problems = this.listProblems(userId);

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const topicStats: Record<
      Topic,
      { easy: number; medium: number; hard: number; total: number; weightedScore: number }
    > = {} as any;

    for (const t of TOPICS) {
      topicStats[t] = { easy: 0, medium: 0, hard: 0, total: 0, weightedScore: 0 };
    }

    for (const p of problems) {
      if (p.difficulty === 'Easy') easyCount++;
      else if (p.difficulty === 'Medium') mediumCount++;
      else if (p.difficulty === 'Hard') hardCount++;

      if (topicStats[p.topic]) {
        if (p.difficulty === 'Easy') topicStats[p.topic].easy++;
        else if (p.difficulty === 'Medium') topicStats[p.topic].medium++;
        else if (p.difficulty === 'Hard') topicStats[p.topic].hard++;

        topicStats[p.topic].total++;
        topicStats[p.topic].weightedScore += DIFFICULTY_WEIGHTS[p.difficulty];
      }
    }

    const topicProgress: TopicProgress[] = TOPICS.map((topic) => ({
      topic,
      ...topicStats[topic],
    }));

    let strongestTopic: Topic | null = null;
    let weakestTopic: Topic | null = null;

    if (problems.length > 0) {
      const sortedByWeight = [...topicProgress].sort((a, b) => b.weightedScore - a.weightedScore);
      strongestTopic = sortedByWeight[0].topic;
      weakestTopic = sortedByWeight[sortedByWeight.length - 1].topic;
    }

    const weeklyProgress: { date: string; count: number }[] = [];
    const dateCounts: Record<string, number> = {};

    problems.forEach((p) => {
      if (p.solvedDate) {
        dateCounts[p.solvedDate] = (dateCounts[p.solvedDate] || 0) + 1;
      }
    });

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyProgress.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
    }

    return {
      totalSolved: problems.length,
      easyCount,
      mediumCount,
      hardCount,
      topicProgress,
      strongestTopic,
      weakestTopic,
      weeklyProgress,
    };
  }

  public getLeaderboard(): LeaderboardEntry[] {
    return this.data.profiles
      .filter((p) => p.leaderboardOptIn)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50)
      .map((p) => ({
        id: p.id,
        displayName: p.displayName || 'Anonymous Quester',
        level: p.level,
        xp: p.xp,
      }));
  }
}

export const localDb = new LocalFileDatabase();

export const memoryStore = {
  clear: () => localDb.reset(),
  profiles: { clear: () => localDb.reset() },
  problems: [],
  missions: [],
  xpEvents: { clear: () => {} },
};

export const db = {
  getProfile: async (userId: string) => localDb.getProfile(userId),
  updateProfile: async (userId: string, data: Partial<UserProfile>) =>
    localDb.updateProfile(userId, data),
  listProblems: async (userId: string) => localDb.listProblems(userId),
  createProblem: async (userId: string, p: Omit<Problem, 'id' | 'userId' | 'createdAt'>) =>
    localDb.createProblem(userId, p),
  updateProblem: async (userId: string, id: string, up: Partial<Problem>) =>
    localDb.updateProblem(userId, id, up),
  deleteProblem: async (userId: string, id: string) => localDb.deleteProblem(userId, id),
  batchInsertProblems: async (userId: string, problems: Omit<Problem, 'id' | 'userId' | 'createdAt'>[]) =>
    localDb.batchInsertProblems(userId, problems),
  listMissions: async (userId: string) => localDb.listMissions(userId),
  createMission: async (m: Omit<Mission, 'id' | 'createdAt' | 'completedAt' | 'status'>) =>
    localDb.createMission(m),
  completeMission: async (userId: string, missionId: string) =>
    localDb.completeMission(userId, missionId),
  getStats: async (userId: string) => localDb.getStats(userId),
  getLeaderboard: async () => localDb.getLeaderboard(),
};
