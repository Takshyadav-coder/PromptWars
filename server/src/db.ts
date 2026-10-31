import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Problem, UserProfile, Mission, TopicProgress, UserStats, LeaderboardEntry, DIFFICULTY_WEIGHTS, Topic, TOPICS, calculateLevel } from '@leetquest/shared';
import { calculateStreak } from './streakEngine';
import { evaluateQuestCompletion } from './questEngine';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// In-memory fallback store for offline tests and development when remote DB is absent
class MemoryStore {
  profiles = new Map<string, UserProfile>();
  problems: Problem[] = [];
  missions: Mission[] = [];
  xpEvents = new Set<string>(); // composite key: missionId

  getOrCreateProfile(userId: string, email?: string): UserProfile {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        id: userId,
        displayName: email ? email.split('@')[0] : 'LeetQuester',
        timezone: 'Asia/Kolkata',
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        leaderboardOptIn: false,
        createdAt: new Date().toISOString(),
      };
      this.profiles.set(userId, profile);
    }
    return profile;
  }
}

export const memoryStore = new MemoryStore();

export interface DbService {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  listProblems(userId: string): Promise<Problem[]>;
  createProblem(userId: string, problem: Omit<Problem, 'id' | 'userId' | 'createdAt'>): Promise<{ problem?: Problem; error?: string }>;
  updateProblem(userId: string, id: string, updates: Partial<Problem>): Promise<Problem | null>;
  deleteProblem(userId: string, id: string): Promise<boolean>;
  batchInsertProblems(userId: string, problems: Omit<Problem, 'id' | 'userId' | 'createdAt'>[]): Promise<{ inserted: Problem[]; skippedCount: number }>;
  listMissions(userId: string): Promise<Mission[]>;
  createMission(mission: Omit<Mission, 'id' | 'createdAt' | 'completedAt' | 'status'>): Promise<Mission>;
  completeMission(userId: string, missionId: string): Promise<{ success: boolean; reason?: string; xpAwarded?: number; profile?: UserProfile }>;
  getStats(userId: string): Promise<UserStats>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

export const db: DbService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) return null;
      return {
        id: data.id,
        displayName: data.display_name,
        timezone: data.timezone,
        xp: data.xp,
        level: data.level,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActiveDate: data.last_active_date,
        leaderboardOptIn: data.leaderboard_opt_in,
        createdAt: data.created_at,
      };
    }

    return memoryStore.getOrCreateProfile(userId);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured && supabaseClient) {
      const updates: Record<string, unknown> = {};
      if (data.displayName !== undefined) updates.display_name = data.displayName;
      if (data.timezone !== undefined) updates.timezone = data.timezone;
      if (data.leaderboardOptIn !== undefined) updates.leaderboard_opt_in = data.leaderboardOptIn;

      const { data: updated, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error || !updated) {
        throw new Error(error?.message || 'Failed to update profile');
      }

      return {
        id: updated.id,
        displayName: updated.display_name,
        timezone: updated.timezone,
        xp: updated.xp,
        level: updated.level,
        currentStreak: updated.current_streak,
        longestStreak: updated.longest_streak,
        lastActiveDate: updated.last_active_date,
        leaderboardOptIn: updated.leaderboard_opt_in,
        createdAt: updated.created_at,
      };
    }

    const profile = memoryStore.getOrCreateProfile(userId);
    if (data.displayName !== undefined) profile.displayName = data.displayName;
    if (data.timezone !== undefined) profile.timezone = data.timezone;
    if (data.leaderboardOptIn !== undefined) profile.leaderboardOptIn = data.leaderboardOptIn;
    return profile;
  },

  async listProblems(userId: string): Promise<Problem[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        difficulty: d.difficulty,
        topic: d.topic,
        url: d.url,
        solvedDate: d.solved_date,
        notes: d.notes,
        createdAt: d.created_at,
      }));
    }

    return memoryStore.problems
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createProblem(userId: string, problem: Omit<Problem, 'id' | 'userId' | 'createdAt'>): Promise<{ problem?: Problem; error?: string }> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('problems')
        .insert({
          user_id: userId,
          title: problem.title,
          difficulty: problem.difficulty,
          topic: problem.topic,
          url: problem.url || null,
          solved_date: problem.solvedDate,
          notes: problem.notes || null,
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'A problem with this title already exists in your solved list.' };
        }
        return { error: error.message };
      }

      return {
        problem: {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          difficulty: data.difficulty,
          topic: data.topic,
          url: data.url,
          solvedDate: data.solved_date,
          notes: data.notes,
          createdAt: data.created_at,
        },
      };
    }

    // Memory Store check
    const duplicate = memoryStore.problems.some(
      (p) => p.userId === userId && p.title.toLowerCase() === problem.title.toLowerCase()
    );
    if (duplicate) {
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
    memoryStore.problems.push(newProblem);
    return { problem: newProblem };
  },

  async updateProblem(userId: string, id: string, updates: Partial<Problem>): Promise<Problem | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const up: Record<string, unknown> = {};
      if (updates.title) up.title = updates.title;
      if (updates.difficulty) up.difficulty = updates.difficulty;
      if (updates.topic) up.topic = updates.topic;
      if (updates.url !== undefined) up.url = updates.url || null;
      if (updates.solvedDate) up.solved_date = updates.solvedDate;
      if (updates.notes !== undefined) up.notes = updates.notes || null;

      const { data, error } = await supabaseClient
        .from('problems')
        .update(up)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        difficulty: data.difficulty,
        topic: data.topic,
        url: data.url,
        solvedDate: data.solved_date,
        notes: data.notes,
        createdAt: data.created_at,
      };
    }

    const idx = memoryStore.problems.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return null;

    const existing = memoryStore.problems[idx];
    const updated = { ...existing, ...updates };
    memoryStore.problems[idx] = updated;
    return updated;
  },

  async deleteProblem(userId: string, id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient
        .from('problems')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      return !error;
    }

    const idx = memoryStore.problems.findIndex((p) => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    memoryStore.problems.splice(idx, 1);
    return true;
  },

  async batchInsertProblems(
    userId: string,
    problems: Omit<Problem, 'id' | 'userId' | 'createdAt'>[]
  ): Promise<{ inserted: Problem[]; skippedCount: number }> {
    const existing = await this.listProblems(userId);
    const existingTitles = new Set(existing.map((p) => p.title.toLowerCase()));

    const toInsert: Omit<Problem, 'id' | 'userId' | 'createdAt'>[] = [];
    let skipped = 0;

    for (const p of problems) {
      const lower = p.title.toLowerCase();
      if (existingTitles.has(lower)) {
        skipped++;
      } else {
        existingTitles.add(lower);
        toInsert.push(p);
      }
    }

    const inserted: Problem[] = [];
    for (const p of toInsert) {
      const res = await this.createProblem(userId, p);
      if (res.problem) {
        inserted.push(res.problem);
      } else {
        skipped++;
      }
    }

    return { inserted, skippedCount: skipped };
  },

  async listMissions(userId: string): Promise<Mission[]> {
    let missions: Mission[] = [];
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('missions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        missions = data.map((m) => ({
          id: m.id,
          userId: m.user_id,
          templateKey: m.template_key,
          title: m.title,
          description: m.description,
          topic: m.topic,
          targetCount: m.target_count,
          xpReward: m.xp_reward,
          status: m.status,
          createdAt: m.created_at,
          completedAt: m.completed_at,
        }));
      }
    } else {
      missions = memoryStore.missions
        .filter((m) => m.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach current qualifying count to active missions
    const userProblems = await this.listProblems(userId);
    return missions.map((m) => {
      const evalResult = evaluateQuestCompletion(m, userProblems);
      return {
        ...m,
        currentCount: evalResult.qualifyingCount,
      };
    });
  },

  async createMission(mission: Omit<Mission, 'id' | 'createdAt' | 'completedAt' | 'status'>): Promise<Mission> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('missions')
        .insert({
          user_id: mission.userId,
          template_key: mission.templateKey,
          title: mission.title,
          description: mission.description,
          topic: mission.topic,
          target_count: mission.targetCount,
          xp_reward: mission.xpReward,
          status: 'active',
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Failed to create mission');
      }

      return {
        id: data.id,
        userId: data.user_id,
        templateKey: data.template_key,
        title: data.title,
        description: data.description,
        topic: data.topic,
        targetCount: data.target_count,
        xpReward: data.xp_reward,
        status: data.status,
        createdAt: data.created_at,
        completedAt: data.completed_at,
      };
    }

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
    memoryStore.missions.push(newMission);
    return newMission;
  },

  async completeMission(
    userId: string,
    missionId: string
  ): Promise<{ success: boolean; reason?: string; xpAwarded?: number; profile?: UserProfile }> {
    if (isSupabaseConfigured && supabaseClient) {
      // Execute the Postgres RPC complete_mission(mission_id, user_id)
      const { data, error } = await supabaseClient.rpc('complete_mission', {
        p_mission_id: missionId,
        p_user_id: userId,
      });

      if (error) {
        return { success: false, reason: error.message };
      }

      if (!data?.success) {
        return { success: false, reason: data?.reason || 'Mission completion failed', xpAwarded: 0 };
      }

      const updatedProfile = await this.getProfile(userId);
      return {
        success: true,
        xpAwarded: data.xpAwarded,
        profile: updatedProfile || undefined,
      };
    }

    // In-memory complete_mission implementation
    const mission = memoryStore.missions.find((m) => m.id === missionId && m.userId === userId);
    if (!mission) {
      return { success: false, reason: 'Mission not found' };
    }

    if (mission.status === 'completed') {
      return { success: false, reason: 'Mission already completed', xpAwarded: 0 };
    }

    // Verify quest completion with questEngine
    const userProblems = await this.listProblems(userId);
    const evalResult = evaluateQuestCompletion(mission, userProblems);
    if (!evalResult.isComplete) {
      return {
        success: false,
        reason: `Mission requirements not met. Solved ${evalResult.qualifyingCount}/${evalResult.targetCount} problems.`,
      };
    }

    // Atomic XP event check (unique constraint simulation)
    if (memoryStore.xpEvents.has(missionId)) {
      return { success: false, reason: 'XP already awarded for this mission', xpAwarded: 0 };
    }
    memoryStore.xpEvents.add(missionId);

    // Update streak and XP
    const profile = memoryStore.getOrCreateProfile(userId);
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

    return {
      success: true,
      xpAwarded: mission.xpReward,
      profile,
    };
  },

  async getStats(userId: string): Promise<UserStats> {
    const problems = await this.listProblems(userId);

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

    // Determine strongest and weakest topics (only consider topics if total problems > 0)
    let strongestTopic: Topic | null = null;
    let weakestTopic: Topic | null = null;

    if (problems.length > 0) {
      const sortedByWeight = [...topicProgress].sort((a, b) => b.weightedScore - a.weightedScore);
      strongestTopic = sortedByWeight[0].topic;
      weakestTopic = sortedByWeight[sortedByWeight.length - 1].topic;
    }

    // Weekly progress: past 7 days
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
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, display_name, level, xp')
        .eq('leaderboard_opt_in', true)
        .order('xp', { ascending: false })
        .limit(50);

      if (error || !data) return [];
      return data.map((d) => ({
        id: d.id,
        displayName: d.display_name || 'Anonymous Quester',
        level: d.level,
        xp: d.xp,
      }));
    }

    return Array.from(memoryStore.profiles.values())
      .filter((p) => p.leaderboardOptIn)
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50)
      .map((p) => ({
        id: p.id,
        displayName: p.displayName || 'Anonymous Quester',
        level: p.level,
        xp: p.xp,
      }));
  },
};
