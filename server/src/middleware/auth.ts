import { Request, Response, NextFunction } from 'express';
import { supabaseClient, isSupabaseConfigured } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Support test bypass in test environment if configured
  if (process.env.NODE_ENV === 'test' || !isSupabaseConfigured) {
    const testUserId = (req.headers['x-test-user-id'] as string) || (authHeader?.replace('Bearer ', '') || 'default-test-user');
    if (testUserId && testUserId !== 'null' && testUserId !== 'undefined') {
      req.user = {
        id: testUserId,
        email: `${testUserId}@example.com`,
      };
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
      };
      return next();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      return res.status(401).json({ error: errorMessage });
    }
  }

  // Fallback when Supabase credentials are not set
  req.user = {
    id: token || 'fallback-user',
    email: 'user@example.com',
  };
  return next();
}
