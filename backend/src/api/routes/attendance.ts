import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireOrganizer } from '../middleware/roles.js';
import * as attendanceService from '../../services/attendance.js';
import * as meetingService from '../../services/meeting.js';

const scanSchema = z.object({
  meetingId: z.string().cuid().optional(),
  qrToken: z.string().optional(),
  attendeeName: z.string().max(200).optional(),
  attendeeEmail: z.string().email().optional(),
}).refine((d) => d.meetingId || d.qrToken, { message: 'meetingId or qrToken required' });

const syncSchema = z.object({
  items: z.array(z.object({
    meetingId: z.string().cuid().optional(),
    qrToken: z.string().optional(),
    scannedAt: z.string().optional(),
  })),
});

export const attendanceRouter = Router();

attendanceRouter.post(
  '/scan',
  authMiddleware(true),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const body = scanSchema.parse(req.body);
      const result = await attendanceService.recordScan({
        meetingId: body.meetingId,
        qrToken: body.qrToken,
        userId: req.user?.sub,
        attendeeName: body.attendeeName,
        attendeeEmail: body.attendeeEmail,
      });
      if (!result) {
        res.status(404).json({ error: 'Not Found', message: 'Meeting not found' });
        return;
      }
      res.status(201).json({
        success: true,
        alreadyRecorded: result.alreadyRecorded,
        attendance: result.attendance,
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);

attendanceRouter.post(
  '/sync',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const body = syncSchema.parse(req.body);
      const results: { success: boolean; alreadyRecorded?: boolean; error?: string }[] = [];
      for (const item of body.items) {
        const result = await attendanceService.recordScan({
          meetingId: item.meetingId,
          qrToken: item.qrToken,
          userId: req.user!.sub,
          attendeeName: undefined,
          attendeeEmail: undefined,
        });
        if (!result) {
          results.push({ success: false, error: 'Meeting not found' });
        } else {
          results.push({ success: true, alreadyRecorded: result.alreadyRecorded });
        }
      }
      res.json({ results });
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);
