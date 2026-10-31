import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { ProfileUpdateSchema } from '@leetquest/shared';

const router = Router();

// GET /api/profile
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await db.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json(profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch profile';
    return res.status(500).json({ error: message });
  }
});

// PUT /api/profile
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parseResult = ProfileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const updated = await db.updateProfile(userId, parseResult.data);
    return res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return res.status(500).json({ error: message });
  }
});

export default router;
