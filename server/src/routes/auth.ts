import { Router, Request, Response } from 'express';
import { localDb } from '../db';
import { hashPassword, generateToken, verifyToken } from '../authService';
import { z } from 'zod';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').optional(),
});

const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0].message,
    });
  }

  const { email, password, displayName } = parsed.data;
  const existing = localDb.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = hashPassword(password);
  const user = localDb.createUser(email, passwordHash, displayName || email.split('@')[0]);
  const token = generateToken(user.id, user.email);
  const profile = localDb.getProfile(user.id);

  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
    profile,
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;
  const user = localDb.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user.id, user.email);
  const profile = localDb.getProfile(user.id);

  return res.json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
    profile,
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = localDb.findUserById(verified.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = localDb.getProfile(user.id);
  return res.json({
    user: { id: user.id, email: user.email, displayName: user.displayName },
    profile,
  });
});

export default router;
