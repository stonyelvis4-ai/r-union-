import { Router, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roles.js';
import { getAdminDashboard } from '../../services/dashboard.js';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/',
  authMiddleware(),
  requireAuth,
  requireAdmin,
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await getAdminDashboard());
    } catch (error) {
      next(error);
    }
  }
);
