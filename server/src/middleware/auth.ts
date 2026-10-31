import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Test header bypass for automated test suites
  const testUserId = req.headers['x-test-user-id'] as string;
  if (testUserId) {
    req.user = {
      id: testUserId,
      email: `${testUserId}@example.com`,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const verified = verifyToken(token);

  if (!verified) {
    // If not a signed token, check if it's a test/demo user id directly
    if (token && !token.includes('.')) {
      req.user = {
        id: token,
        email: `${token}@example.com`,
      };
      return next();
    }
    return res.status(401).json({ error: 'Invalid or expired authentication session' });
  }

  req.user = {
    id: verified.userId,
    email: verified.email,
  };
  return next();
}
