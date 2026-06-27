import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'worknest-secret-key-2026-demo-only');

export async function signToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: payload.userId as string,
    email: payload.email as string,
    role: payload.role as string,
  };
}

export function extractToken(request: Request): string | null {
  const header = request.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// WARNING: Demo-only hash function. Use bcrypt/scrypt in production.
export function hashPassword(password: string): string {
  // Simple hash for demo purposes - NOT for production
  let hash = 0;
  const salt = 'worknest-salt';
  const salted = salt + password;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(36);
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
