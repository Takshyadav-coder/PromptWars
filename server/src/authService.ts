import crypto from 'crypto';

const AUTH_SECRET = process.env.JWT_SECRET || 'leetquest-super-secret-local-key-2026';

export function hashPassword(password: string): string {
  const salt = 'lq_salt_';
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

export function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
