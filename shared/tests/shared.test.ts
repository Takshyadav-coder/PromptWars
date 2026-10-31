import { describe, it, expect } from 'vitest';
import { TOPICS, DIFFICULTIES, MISSION_TEMPLATES, ProblemInputSchema, CsvRowSchema } from '../src/index';

describe('Shared package tests', () => {
  it('contains all 12 core DSA topics', () => {
    expect(TOPICS).toHaveLength(12);
    expect(TOPICS).toContain('Arrays');
    expect(TOPICS).toContain('DP');
    expect(TOPICS).toContain('Trees');
    expect(TOPICS).toContain('Graphs');
  });

  it('contains Easy, Medium, Hard difficulties', () => {
    expect(DIFFICULTIES).toEqual(['Easy', 'Medium', 'Hard']);
  });

  it('contains all 4 mission templates with valid target counts', () => {
    const keys = Object.keys(MISSION_TEMPLATES);
    expect(keys).toContain('array_warrior');
    expect(keys).toContain('string_master');
    expect(keys).toContain('tree_explorer');
    expect(keys).toContain('dp_boss');
    expect(MISSION_TEMPLATES.array_warrior.targetCount).toBe(3);
    expect(MISSION_TEMPLATES.dp_boss.targetCount).toBe(1);
  });

  it('validates LeetCode URLs with ProblemInputSchema', () => {
    const valid = ProblemInputSchema.safeParse({
      title: 'Valid Problem',
      difficulty: 'Easy',
      topic: 'Arrays',
      url: 'https://leetcode.com/problems/two-sum/',
      solvedDate: '2026-05-01',
    });
    expect(valid.success).toBe(true);

    const invalid = ProblemInputSchema.safeParse({
      title: 'Invalid URL',
      difficulty: 'Easy',
      topic: 'Arrays',
      url: 'https://google.com/search',
      solvedDate: '2026-05-01',
    });
    expect(invalid.success).toBe(false);
  });
});
