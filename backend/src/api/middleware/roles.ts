import { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

export function requireOrganizer(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden', message: 'Admin role required' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden', message: 'Admin role required' });
    return;
  }
  next();
}
