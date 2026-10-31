import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { ProblemInputSchema } from '@leetquest/shared';
import { parseAndValidateCsv } from '../csvParser';

const router = Router();

// GET /api/problems
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const problems = await db.listProblems(userId);
    return res.json(problems);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch problems';
    return res.status(500).json({ error: message });
  }
});

// POST /api/problems
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const parseResult = ProblemInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const { title, difficulty, topic, url, solvedDate, notes } = parseResult.data;
    const result = await db.createProblem(userId, {
      title,
      difficulty,
      topic,
      url: url || null,
      solvedDate,
      notes: notes || null,
    });

    if (result.error) {
      return res.status(409).json({ error: result.error });
    }

    return res.status(201).json(result.problem);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create problem';
    return res.status(500).json({ error: message });
  }
});

// PUT /api/problems/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const parseResult = ProblemInputSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const updated = await db.updateProblem(userId, id, parseResult.data);
    if (!updated) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update problem';
    return res.status(500).json({ error: message });
  }
});

// DELETE /api/problems/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const success = await db.deleteProblem(userId, id);
    if (!success) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.json({ success: true, message: 'Problem deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete problem';
    return res.status(500).json({ error: message });
  }
});

// POST /api/problems/import
router.post('/import', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { csvContent } = req.body;

    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'csvContent string is required in request body' });
    }

    const existingProblems = await db.listProblems(userId);
    const existingTitles = new Set(existingProblems.map((p) => p.title.toLowerCase()));

    const parseResult = parseAndValidateCsv(csvContent, existingTitles);

    if (parseResult.errors.length > 0 && parseResult.validProblems.length === 0) {
      return res.status(400).json({
        error: 'CSV validation failed',
        errors: parseResult.errors,
      });
    }

    const { inserted, skippedCount } = await db.batchInsertProblems(
      userId,
      parseResult.validProblems.map((p) => ({
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        url: p.url || null,
        solvedDate: p.solvedDate,
        notes: p.notes || null,
      }))
    );

    return res.json({
      success: true,
      insertedCount: inserted.length,
      skippedCount: skippedCount + parseResult.skippedCount,
      errors: parseResult.errors,
      problems: inserted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to import CSV';
    return res.status(500).json({ error: message });
  }
});

export default router;
