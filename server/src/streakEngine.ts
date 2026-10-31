export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // format: 'YYYY-MM-DD'
  timezone: string; // IANA timezone e.g. 'Asia/Kolkata'
}

export interface StreakEvaluationResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakUpdated: boolean;
  dayDifference: number | null;
}

/**
 * Get date string YYYY-MM-DD in the specified IANA timezone.
 */
export function getLocalDateString(date: Date, timeZone: string = 'Asia/Kolkata'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback if invalid timezone provided
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }
}

/**
 * Pure streak calculation engine.
 * - Same day as last_active_date: no change
 * - Previous day: streak + 1
 * - Older or none: streak = 1
 * - Track longest_streak = Math.max(longest_streak, new_streak)
 */
export function calculateStreak(
  currentState: StreakState,
  completionTime: Date = new Date()
): StreakEvaluationResult {
  const localToday = getLocalDateString(completionTime, currentState.timezone);

  if (!currentState.lastActiveDate) {
    const newStreak = 1;
    const longest = Math.max(currentState.longestStreak || 0, newStreak);
    return {
      currentStreak: newStreak,
      longestStreak: longest,
      lastActiveDate: localToday,
      streakUpdated: true,
      dayDifference: null,
    };
  }

  const todayEpochDays = Math.floor(
    new Date(`${localToday}T00:00:00Z`).getTime() / (1000 * 60 * 60 * 24)
  );
  const lastEpochDays = Math.floor(
    new Date(`${currentState.lastActiveDate}T00:00:00Z`).getTime() / (1000 * 60 * 60 * 24)
  );

  const diffDays = todayEpochDays - lastEpochDays;

  if (diffDays === 0) {
    // Same day: no change to streaks
    return {
      currentStreak: currentState.currentStreak,
      longestStreak: currentState.longestStreak,
      lastActiveDate: localToday,
      streakUpdated: false,
      dayDifference: 0,
    };
  } else if (diffDays === 1) {
    // Previous day: streak + 1
    const newStreak = currentState.currentStreak + 1;
    const newLongest = Math.max(currentState.longestStreak, newStreak);
    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: localToday,
      streakUpdated: true,
      dayDifference: 1,
    };
  } else {
    // Older (diffDays > 1) or time anomaly (diffDays < 0): streak resets to 1
    const newStreak = 1;
    const newLongest = Math.max(currentState.longestStreak, newStreak);
    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: localToday,
      streakUpdated: true,
      dayDifference: diffDays,
    };
  }
}
