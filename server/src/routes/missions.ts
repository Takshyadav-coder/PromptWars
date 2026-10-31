import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { MISSION_TEMPLATES, MissionTemplate } from '@leetquest/shared';

const router = Router();

// GET /api/missions
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const missions = await db.listMissions(userId);
    return res.json(missions);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch missions';
    return res.status(500).json({ error: message });
  }
});

// POST /api/missions/generate
router.post('/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const existingMissions = await db.listMissions(userId);
    const activeMissions = existingMissions.filter((m) => m.status === 'active');
    const activeTemplateKeys = new Set(activeMissions.map((m) => m.templateKey));

    // Get user stats to determine topic weakness
    const stats = await db.getStats(userId);
    const topicScoreMap = new Map<string, number>();
    stats.topicProgress.forEach((tp) => topicScoreMap.set(tp.topic, tp.weightedScore));

    // Available templates (at most one active mission per template)
    const availableTemplates: MissionTemplate[] = Object.values(MISSION_TEMPLATES).filter(
      (tmpl) => !activeTemplateKeys.has(tmpl.key)
    );

    if (availableTemplates.length === 0) {
      return res.status(400).json({
        error: 'You already have active missions for all available quest templates. Complete or clear active missions first!',
      });
    }

    // Sort available templates by user's weakness in that topic (lowest score first)
    availableTemplates.sort((a, b) => {
      const scoreA = topicScoreMap.get(a.topic) ?? 0;
      const scoreB = topicScoreMap.get(b.topic) ?? 0;
      return scoreA - scoreB;
    });

    // Select the best template
    const selectedTemplate = availableTemplates[0];

    const newMission = await db.createMission({
      userId,
      templateKey: selectedTemplate.key,
      title: selectedTemplate.title,
      description: selectedTemplate.description,
      topic: selectedTemplate.topic,
      targetCount: selectedTemplate.targetCount,
      xpReward: selectedTemplate.xpReward,
    });

    return res.status(201).json(newMission);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate mission';
    return res.status(500).json({ error: message });
  }
});

// POST /api/missions/:id/complete
router.post('/:id/complete', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await db.completeMission(userId, id);
    if (!result.success) {
      return res.status(400).json({
        error: result.reason || 'Failed to complete mission',
        xpAwarded: result.xpAwarded || 0,
      });
    }

    return res.json({
      success: true,
      message: 'Mission completed successfully!',
      xpAwarded: result.xpAwarded,
      profile: result.profile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete mission';
    return res.status(500).json({ error: message });
  }
});

export default router;
