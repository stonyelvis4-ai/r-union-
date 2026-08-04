import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  version?: number;
  iat?: number;
  exp?: number;
}

export function issueToken(
  payload: { sub: string; email: string; role: string; version?: number },
  secret: string
): string {
  return jwt.sign(
    { sub: payload.sub, email: payload.email, role: payload.role, version: payload.version ?? 0 },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}
