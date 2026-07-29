import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
