export interface MinimalMission {
  id: string;
  topic: string;
  targetCount: number;
  createdAt: string | Date;
}

export interface MinimalProblem {
  id: string;
  topic: string;
  createdAt: string | Date;
}

export interface QuestEvaluationResult {
  isComplete: boolean;
  qualifyingCount: number;
  targetCount: number;
  remainingCount: number;
  qualifyingProblemIds: string[];
}

/**
 * Pure quest verification engine.
 * Rule: Count ONLY problems with the exact matching topic whose SERVER created_at
 * is strictly after (>) the mission's created_at.
 * The mission is complete when qualifying count >= targetCount.
 */
export function evaluateQuestCompletion(
  mission: MinimalMission,
  problems: MinimalProblem[]
): QuestEvaluationResult {
  const missionCreatedAt = new Date(mission.createdAt).getTime();

  const qualifyingProblems = problems.filter((problem) => {
    // Exact topic match
    if (problem.topic !== mission.topic) {
      return false;
    }

    // Server created_at strictly after mission created_at
    const problemCreatedAt = new Date(problem.createdAt).getTime();
    return problemCreatedAt > missionCreatedAt;
  });

  const qualifyingCount = qualifyingProblems.length;
  const targetCount = mission.targetCount;
  const isComplete = qualifyingCount >= targetCount;
  const remainingCount = Math.max(0, targetCount - qualifyingCount);

  return {
    isComplete,
    qualifyingCount,
    targetCount,
    remainingCount,
    qualifyingProblemIds: qualifyingProblems.map((p) => p.id),
  };
}
