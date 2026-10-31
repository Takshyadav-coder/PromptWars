import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth';
import problemsRouter from './routes/problems';
import missionsRouter from './routes/missions';
import statsRouter from './routes/stats';
import profileRouter from './routes/profile';
import leaderboardRouter from './routes/leaderboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/healthz', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'leetquest-api',
    timestamp: new Date().toISOString(),
  });
});

// Protected API Routes
app.use('/api/problems', requireAuth, problemsRouter);
app.use('/api/missions', requireAuth, missionsRouter);
app.use('/api/stats', requireAuth, statsRouter);
app.use('/api/profile', requireAuth, profileRouter);

// Public or semi-public API routes
app.use('/api/leaderboard', leaderboardRouter);

// Serve Client static assets in production if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[LEETQUEST] Server running on port ${PORT}`);
  });
}

export default app;
