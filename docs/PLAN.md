# LEETQUEST Architecture & Implementation Plan

## 1. Overview
LEETQUEST is a gamified Data Structures and Algorithms (DSA) tracker. Users track solved LeetCode problems, identify their weakest DSA topics, generate targeted missions, and earn XP, levels, and streak counters verified server-side.

## 2. Monorepo Architecture
```
leetquest/
├── shared/                  # Common TypeScript types, constants, game rules, zod schemas
│   ├── src/constants.ts     # Topics, Difficulties, MissionTemplates
│   ├── src/gameRules.ts     # Difficulty weights, level formulas, XP rewards
│   ├── src/curatedProblems.ts # Static curated problems database (~60 LeetCode problems)
│   ├── src/schemas.ts       # Zod schemas for validation
│   └── src/types.ts         # TypeScript definitions
├── server/                  # Node.js + Express + TypeScript + Zod
│   ├── src/questEngine.ts   # Pure mission completion verification logic
│   ├── src/streakEngine.ts  # Timezone-aware streak tracking logic
│   ├── src/csvParser.ts     # Safe CSV parsing with formula injection protection
│   ├── src/db.ts            # Supabase Postgres client + safe fallback
│   ├── src/middleware/auth.ts # Supabase JWT verification
│   ├── src/routes/          # API route handlers
│   └── tests/               # Vitest suite
├── client/                  # React + Vite + TypeScript + React Router + Recharts
│   ├── src/components/      # UI component library (Card, Button, ProgressBar, etc.)
│   ├── src/pages/           # App pages (Dashboard, Missions, Progress, Leaderboard, etc.)
│   ├── src/hooks/           # Custom data fetch and state hooks
│   └── src/styles/          # Vanilla CSS gaming theme (dark futuristic)
└── supabase/migrations/     # PostgreSQL schema, RLS policies, complete_mission()
```

## 3. Core Game Mechanics
- **Difficulty Weights**: Easy = 1, Medium = 2, Hard = 3.
- **Level Formula**: `Math.floor(Math.sqrt(xp / 100)) + 1`
- **Mission Rewards**:
  - Array Warrior: 100 XP (3 Arrays)
  - String Master: 70 XP (2 Strings)
  - Tree Explorer: 70 XP (2 Trees)
  - DP Boss: 100 XP (1 DP)
- **Streak Calculation**:
  - Local midnight evaluated using user IANA timezone (default `Asia/Kolkata`).
  - Active today: maintain streak.
  - Active yesterday: streak += 1, update longest streak.
  - Older/no previous active date: reset streak to 1.
- **Verification Guarantee**: Server-only mission completion via PostgreSQL atomic transaction (`complete_mission`) and unique constraint on `xp_events(mission_id)`.

## 4. API Endpoints
- `GET /healthz` - Health status
- `GET /api/problems` - List user problems with filters
- `POST /api/problems` - Add new problem (unique title per user)
- `PUT /api/problems/:id` - Update problem details
- `DELETE /api/problems/:id` - Delete problem
- `POST /api/problems/import` - Batch CSV import (<=2000 rows, <=1MB, formula sanitized)
- `GET /api/stats` - User DSA metrics, topic weights, weekly activity
- `GET /api/missions` - List user missions (active/completed)
- `POST /api/missions/generate` - Generate mission based on weakest topic
- `POST /api/missions/:id/complete` - Verify and award XP atomically
- `GET /api/profile` - Fetch user profile (XP, level, streaks, timezone)
- `PUT /api/profile` - Update profile (display name, timezone, leaderboard opt-in)
- `GET /api/leaderboard` - Public leaderboard of opted-in users
