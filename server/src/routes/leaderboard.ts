import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/leaderboard
router.get('/', async (_req: Request, res: Response) => {
  try {
    const leaderboard = await db.getLeaderboard();
    return res.json(leaderboard);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
    return res.status(500).json({ error: message });
  }
});

export default router;
