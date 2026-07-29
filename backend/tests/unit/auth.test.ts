import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, issueToken, verifyToken } from '@/services/auth';

describe('Auth service', () => {
  it('hashPassword returns a hash different from plain text', async () => {
    const plain = 'password123';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifyPassword returns true for correct password', async () => {
    const plain = 'password123';
    const hash = await hashPassword(plain);
    const ok = await verifyPassword(plain, hash);
    expect(ok).toBe(true);
  });

  it('verifyPassword returns false for wrong password', async () => {
    const hash = await hashPassword('password123');
    const ok = await verifyPassword('wrong', hash);
    expect(ok).toBe(false);
  });

  it('issueToken and verifyToken roundtrip', () => {
    const secret = 'test-secret';
    const payload = { sub: 'user-1', email: 'u@test.com', role: 'ORGANIZER' };
    const token = issueToken(payload, secret);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    const decoded = verifyToken(token, secret);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it('verifyToken returns null for invalid token', () => {
    const secret = 'test-secret';
    expect(verifyToken('invalid', secret)).toBeNull();
    expect(verifyToken('', secret)).toBeNull();
  });
});
