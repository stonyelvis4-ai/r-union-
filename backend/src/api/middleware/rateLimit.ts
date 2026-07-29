import type { NextFunction, Request, Response } from 'express';

type RateLimitOptions = { windowMs: number; max: number };

/** Lightweight protection for public endpoints. */
export function rateLimit({ windowMs, max }: RateLimitOptions) {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}`;
    const current = attempts.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    entry.count += 1;
    attempts.set(key, entry);
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ error: 'Too Many Requests', message: 'Réessayez plus tard.' });
      return;
    }
    next();
  };
}
