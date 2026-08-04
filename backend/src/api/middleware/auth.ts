import { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../../services/auth.js';
import { getEnv } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(optional = false) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      if (optional) return next();
      res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
      return;
    }

    const secret = getEnv().JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' });
      return;
    }

    const payload = verifyToken(token, secret);
    if (!payload) {
      if (optional) return next();
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { isActive: true, tokenVersion: true } });
      if (!user || !user.isActive || (payload.version ?? 0) !== user.tokenVersion) {
        res.status(401).json({ error: 'Unauthorized', message: 'Session expired' });
        return;
      }
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
}
