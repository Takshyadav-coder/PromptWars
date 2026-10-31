# LEETQUEST ⚔️

**LEETQUEST** is a gamified Data Structures and Algorithms (DSA) progress tracker and RPG-style progression system. Users log their solved LeetCode challenges, inspect analytics across 12 core DSA topics, automatically generate missions tailored to their weakest categories, and earn server-verified XP, levels, and daily streaks.

---

## Problem Statement
Grinding LeetCode problems often feels repetitive, lonely, and directionless. Learners frequently gravitate toward topics they are already comfortable with (e.g. Arrays, Two Pointers) while neglecting their weakest areas (e.g. Dynamic Programming, Graphs). Furthermore, existing trackers lack motivation mechanics like streak preservation, level escalation, or quest bounties.

LEETQUEST transforms DSA practice into a structured RPG where consistency and tackling weak areas are directly rewarded.

---

## Key Features

1. **Self-Reported Problem Logging & Management**
   - Record problem title, difficulty (Easy, Medium, Hard), topic, optional LeetCode URL, solved date, and key algorithmic notes.
   - Case-insensitive duplicate rejection per user.
   - Comprehensive edit and delete capabilities with modal confirmation.

2. **Secure Batch CSV Import**
   - Import up to 2,000 problem rows and 1 MB file size.
   - Client-side data preview and line-by-line validation.
   - **Formula Injection Guard**: Automatically neutralizes spreadsheet formula injection by escaping cells beginning with `=`, `+`, `-`, `@`, `\t`, or `\r`.

3. **Weak-Topic Mission Generator**
   - Evaluates weighted mastery scores across all 12 DSA domains (`Easy=1`, `Medium=2`, `Hard=3`).
   - Automatically orders and generates bounty quests starting from the user's weakest topics:
     - **Array Warrior**: Solve 3 Arrays problems (100 XP)
     - **String Master**: Solve 2 Strings problems (70 XP)
     - **Tree Explorer**: Solve 2 Trees problems (70 XP)
     - **DP Boss**: Solve 1 Dynamic Programming problem (100 XP)
   - Recommends real problems from a curated database of 60 LeetCode problems with direct links.

4. **Server-Verified XP & Level Progression**
   - **Anti-Cheat Guarantee**: Quest completion is verified strictly on the server (`questEngine`). Only problems created *after* quest acceptance count toward completion.
   - **Exactly-Once XP Award**: Enforced atomically via PostgreSQL `xp_events(mission_id UNIQUE)` table constraint and `complete_mission` stored procedure. Duplicate requests yield 0 additional XP.
   - Level progression formula: `Level = floor(sqrt(xp / 100)) + 1`.

5. **Timezone-Aware Daily Streaks**
   - Streak calculation is evaluated using the user's configured IANA timezone (default `Asia/Kolkata`).
   - Same day activity preserves streaks without penalty.
   - Consecutive day activity increases streaks and updates all-time longest streak records.

6. **Opt-in Public Leaderboard & Privacy**
   - Privacy-first design: User records are private by default.
   - Users can opt-in to the "Hall of Grandmasters" public leaderboard from their Profile Settings.

7. **A11y & WCAG 2.2 AA Compliance**
   - Semantic HTML5 structure with landmark roles.
   - Accessible skip link (`#main-content`).
   - Visual focus rings for keyboard navigation.
   - Screen-reader text and data-table fallbacks for all Recharts visualizations.
   - Dedicated `aria-live="polite"` announcements for XP and notification toasts.
   - Full support for `prefers-reduced-motion`.

---

## Tech Stack

- **Monorepo**: npm workspaces (`shared/`, `server/`, `client/`)
- **Frontend**: React 18, Vite, TypeScript, React Router 6, Recharts, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express, TypeScript, Zod validation
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security + Auth JWT verification)
- **Testing**: Vitest (Unit & API tests), Playwright & `@axe-core/playwright` (E2E & Accessibility)
- **Containerization**: Multi-stage Dockerfile (Alpine Linux, non-root user)

---

## Installation & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup Steps
```bash
# Clone the repository
git clone <repo-url>
cd Promptwar

# Install all workspace dependencies
npm install

# Build the shared contract package
npm run build --workspace=shared

# Run server unit & API tests
npm run test --workspace=server

# Run client development server (proxies API to port 8080)
npm run dev --workspace=client

# Run backend development server (listens on port 8080)
npm run dev --workspace=server
```

---

## Environment Variables

### Client (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Server (`server/.env`)
```env
PORT=8080
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

*Note: If Supabase credentials are not provided, the application automatically runs in local development/fallback mode using deterministic in-memory storage, allowing offline evaluation and automated testing.*

---

## Deploying to Google Cloud Run

To build and deploy the containerized production image to Google Cloud Run:

```bash
# 1. Build and tag the Docker image
docker build -t gcr.io/<PROJECT_ID>/leetquest:latest .

# 2. Push to Google Container Registry or Artifact Registry
docker push gcr.io/<PROJECT_ID>/leetquest:latest

# 3. Deploy to Cloud Run
gcloud run deploy leetquest \
  --image gcr.io/<PROJECT_ID>/leetquest:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=..."
```

---

## Limitations & Honest Disclosure

- **Self-Reported Data**: LeetCode does not offer a public write-API for third-party solvers. Solved problems are self-reported by the user (either manually or via CSV export/import). There is no automated browser scraping or direct session sync with LeetCode.com.
- **Quest Completion Window**: To prevent retroactive spamming, missions only count problems solved *after* the quest was accepted. Past problems in your inventory do not autocomplete new missions.
