export const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Binary Search',
  'Recursion',
  'Backtracking',
  'Greedy',
  'DP',
] as const;

export type Topic = (typeof TOPICS)[number];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export interface MissionTemplate {
  key: string;
  title: string;
  description: string;
  topic: Topic;
  targetCount: number;
  xpReward: number;
}

export const MISSION_TEMPLATES: Record<string, MissionTemplate> = {
  array_warrior: {
    key: 'array_warrior',
    title: 'Array Warrior',
    description: 'Solve 3 new Arrays problems to sharpen your fundamentals.',
    topic: 'Arrays',
    targetCount: 3,
    xpReward: 100,
  },
  string_master: {
    key: 'string_master',
    title: 'String Master',
    description: 'Solve 2 new Strings problems to conquer text manipulation.',
    topic: 'Strings',
    targetCount: 2,
    xpReward: 70,
  },
  tree_explorer: {
    key: 'tree_explorer',
    title: 'Tree Explorer',
    description: 'Solve 2 new Trees problems to master hierarchical algorithms.',
    topic: 'Trees',
    targetCount: 2,
    xpReward: 70,
  },
  dp_boss: {
    key: 'dp_boss',
    title: 'DP Boss',
    description: 'Solve 1 new Dynamic Programming problem to build optimal sub-structures.',
    topic: 'DP',
    targetCount: 1,
    xpReward: 100,
  },
};
