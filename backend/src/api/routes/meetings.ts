import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireOrganizer } from '../middleware/roles.js';
import * as meetingService from '../../services/meeting.js';
import * as participantService from '../../services/participant.js';
import * as attendanceService from '../../services/attendance.js';
import * as searchService from '../../services/search.js';

const searchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  organizerId: z.string().cuid().optional(),
  searchInTranscript: z.enum(['true', 'false']).optional(),
});

export const meetingsRouter = Router();

meetingsRouter.get(
  '/search',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return;
      const query = searchQuerySchema.parse(req.query);
      const meetings = await searchService.searchMeetings({
        q: query.q,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        organizerId: query.organizerId,
        searchInTranscript: query.searchInTranscript === 'true',
        userId: req.user.sub,
        isAdmin: req.user.role === 'ADMIN',
      });
      res.json(meetings);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);

const createMeetingSchema = z.object({
  title: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(500).optional(),
  agenda: z.string().max(10000).optional(),
  participantEmails: z.array(z.string().email()).optional(),
});

const updateMeetingSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  location: z.string().max(500).optional(),
  agenda: z.string().max(10000).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
});

const addParticipantSchema = z.object({
  email: z.string().email(),
  displayName: z.string().max(200).optional(),
});

meetingsRouter.get(
  '/',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return;
      const meetings = req.user.role === 'ADMIN'
        ? await meetingService.listAllMeetings()
        : await meetingService.listMeetingsForParticipant(req.user.email);
      res.json(meetings);
    } catch (e) {
      next(e);
    }
  }
);

meetingsRouter.post(
  '/',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return;
      const body = createMeetingSchema.parse(req.body);
      const meeting = await meetingService.createMeeting({
        ...body,
        ownerId: req.user.sub,
      });
      res.status(201).json(meeting);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);

meetingsRouter.get(
  '/:id',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      if (req.user!.role !== 'ADMIN' && !(await meetingService.isParticipantOfMeeting(meeting.id, req.user!.email))) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      res.json(meeting);
    } catch (e) {
      next(e);
    }
  }
);

/** Infos publiques pour la page « inscription présence » (sans auth, après scan QR). */
meetingsRouter.get(
  '/:id/public',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingPublic(req.params.id);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      res.json(meeting);
    } catch (e) {
      next(e);
    }
  }
);

meetingsRouter.get('/:id/qr', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const qrToken = req.query.qrToken as string | undefined;
    const meeting = qrToken
      ? await meetingService.getMeetingByQrToken(qrToken)
      : await meetingService.getMeetingById(id);
    if (!meeting) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json({ qrToken: meeting.qrToken, meetingId: meeting.id });
  } catch (e) {
    next(e);
  }
});

meetingsRouter.get(
  '/:id/attendance',
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
      const list = await attendanceService.listByMeeting(req.params.id);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

meetingsRouter.patch(
  '/:id',
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
        res.status(403).json({ error: 'Forbidden', message: 'Not the meeting owner' });
        return;
      }
      const body = updateMeetingSchema.parse(req.body);
      const updated = await meetingService.updateMeeting(req.params.id, {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      });
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);

meetingsRouter.delete(
  '/:id',
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
        res.status(403).json({ error: 'Forbidden', message: 'Not the meeting owner' });
        return;
      }
      await meetingService.deleteMeeting(req.params.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

meetingsRouter.get(
  '/:meetingId/participants',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const list = await participantService.listParticipantsByMeeting(req.params.meetingId);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

meetingsRouter.post(
  '/:meetingId/participants',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.meetingId);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      if (meeting.ownerId !== req.user!.sub && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      const body = addParticipantSchema.parse(req.body);
      const participant = await participantService.addParticipant(
        req.params.meetingId,
        body.email,
        body.displayName
      );
      res.status(201).json(participant);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
        return;
      }
      next(e);
    }
  }
);

meetingsRouter.delete(
  '/:meetingId/participants/:id',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const meeting = await meetingService.getMeetingById(req.params.meetingId);
      if (!meeting) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      if (meeting.ownerId !== req.user!.sub && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      await participantService.removeParticipant(req.params.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);
