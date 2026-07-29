import { Router, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireOrganizer } from '../middleware/roles.js';
import * as transcriptionService from '../../services/transcription.js';
import * as meetingService from '../../services/meeting.js';

export const transcriptionRouter = Router();

transcriptionRouter.get(
  '/meetings/:id/transcription',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      const transcription = await transcriptionService.getTranscription(req.params.id);
      if (!transcription) {
        res.json({ status: 'pending', fullText: null });
        return;
      }
      res.json(transcription);
    } catch (e) {
      next(e);
    }
  }
);

transcriptionRouter.post(
  '/meetings/:id/transcription/retry',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      if (meeting.ownerId !== req.user!.sub && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      const transcription = await transcriptionService.getTranscription(req.params.id);
      if (!transcription) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      if (transcription.status !== 'failed') {
        res.status(400).json({ error: 'Bad Request', message: 'Can only retry failed transcription' });
        return;
      }
      res.json({ message: 'Retry not implemented in stub' });
    } catch (e) {
      next(e);
    }
  }
);
