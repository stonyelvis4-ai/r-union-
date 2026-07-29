import { Router, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as meetingService from '../../services/meeting.js';
import * as summaryService from '../../services/summary.js';
import * as reportExport from '../../services/report-export.js';

export const summaryRouter = Router();

summaryRouter.get(
  '/meetings/:id/summary',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      const summary = await summaryService.getSummary(req.params.id);
      if (!summary) {
        res.status(404).json({ error: 'Not Found', message: 'No summary yet' });
        return;
      }
      res.json(summary);
    } catch (e) {
      next(e);
    }
  }
);

summaryRouter.get(
  '/meetings/:id/report',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string)?.toLowerCase() || 'pdf';
      if (format !== 'pdf' && format !== 'docx') {
        res.status(400).json({ error: 'Bad Request', message: 'format must be pdf or docx' });
        return;
      }
      const meeting = await meetingService.getMeetingById(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      const summary = await summaryService.getSummary(req.params.id);
      if (!summary) {
        res.status(404).json({ error: 'Not Found', message: 'Generate a summary first' });
        return;
      }
      const filename = `rapport-${meeting.title.replace(/[^a-z0-9]/gi, '-')}-${req.params.id.slice(0, 8)}.${format}`;
      if (format === 'pdf') {
        const buffer = await reportExport.buildPdfBuffer(summary);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
      } else {
        const buffer = await reportExport.buildDocxBuffer(summary);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
      }
    } catch (e) {
      next(e);
    }
  }
);

summaryRouter.post(
  '/meetings/:id/summary/generate',
  authMiddleware(),
  requireAuth,
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
      const result = await summaryService.generateSummary(req.params.id);
      if (!result) {
        res
          .status(400)
          .json({ error: 'Bad Request', message: 'Transcription not ready or summary already exists' });
        return;
      }
      const summary = await summaryService.getSummary(req.params.id);
      res.status(201).json(summary);
    } catch (e) {
      next(e);
    }
  }
);

summaryRouter.post(
  '/meetings/:id/report/send',
  authMiddleware(),
  requireAuth,
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
      const existingSummary = await summaryService.getSummary(req.params.id);
      if (!existingSummary) {
        res.status(400).json({ error: 'Bad Request', message: 'Generate a summary first' });
        return;
      }
      const ok = await summaryService.resendReport(req.params.id);
      if (!ok) {
        res.status(400).json({ error: 'Bad Request', message: 'No participants to send report to' });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);
