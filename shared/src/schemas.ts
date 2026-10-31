import { z } from 'zod';
import { DIFFICULTIES, TOPICS } from './constants';

export const LeetCodeUrlRegex = /^https:\/\/(www\.)?leetcode\.com\/problems\/[a-zA-Z0-9_-]+\/?.*$/;

export const ProblemInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
  difficulty: z.enum(DIFFICULTIES, {
    errorMap: () => ({ message: 'Difficulty must be Easy, Medium, or Hard' }),
  }),
  topic: z.enum(TOPICS, {
    errorMap: () => ({ message: 'Invalid DSA topic' }),
  }),
  url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || LeetCodeUrlRegex.test(val), {
      message: 'URL must start with https://leetcode.com/problems/...',
    }),
  solvedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .refine((val) => {
      const today = new Date().toISOString().split('T')[0];
      return val <= today;
    }, {
      message: 'Solved date cannot be in the future',
    }),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().or(z.literal('')),
});

export type ProblemInput = z.infer<typeof ProblemInputSchema>;

export const CsvRowSchema = z.object({
  Title: z.string().trim().min(1, 'Title required'),
  Difficulty: z.enum(DIFFICULTIES),
  Topic: z.enum(TOPICS),
  Link: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || LeetCodeUrlRegex.test(val), {
      message: 'Invalid LeetCode URL',
    }),
  SolvedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((val) => {
      const today = new Date().toISOString().split('T')[0];
      return val <= today;
    }, { message: 'Date cannot be in the future' }),
  Notes: z.string().max(1000).optional().or(z.literal('')),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;

export const ProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(30).optional(),
  timezone: z
    .string()
    .trim()
    .refine((tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, { message: 'Invalid IANA timezone' })
    .optional(),
  leaderboardOptIn: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

export const MissionGenerateSchema = z.object({
  templateKey: z.string().optional(),
});
