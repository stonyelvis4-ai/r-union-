import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireOrganizer } from '../middleware/roles.js';
import * as meetingService from '../../services/meeting.js';
import * as recordingService from '../../services/recording.js';
import * as transcriptionService from '../../services/transcription.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

export const recordingRouter = Router();

recordingRouter.post(
  '/meetings/:id/recording/start',
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
      const result = await recordingService.startRecording(req.params.id, req.user!.sub, req.user!.role === 'ADMIN');
      if (!result) {
        res.status(400).json({ error: 'Bad Request', message: 'Cannot start recording' });
        return;
      }
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

recordingRouter.post(
  '/meetings/:id/recording/pause',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      recordingService.pauseRecording(req.params.id);
      res.json({ status: 'paused' });
    } catch (e) {
      next(e);
    }
  }
);

recordingRouter.post(
  '/meetings/:id/recording/stop',
  authMiddleware(),
  requireAuth,
  requireOrganizer,
  upload.single('audio'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file?.buffer) {
        res.status(400).json({ error: 'Bad Request', message: 'Audio file required' });
        return;
      }
      const result = await recordingService.stopRecording(
        req.params.id,
        req.user!.sub,
        file.buffer,
        req.body.durationSeconds ? Number(req.body.durationSeconds) : undefined
      );
      if (!result) {
        res.status(400).json({ error: 'Bad Request', message: 'Cannot stop recording' });
        return;
      }
      transcriptionService.runTranscriptionJob(result.id).catch((err) => console.error('Transcription job error:', err));
      res.json({ recordingId: result.id });
    } catch (e) {
      next(e);
    }
  }
);

recordingRouter.get(
  '/meetings/:id/recording',
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
      const recording = await recordingService.getRecording(req.params.id);
      if (!recording) {
        res.status(404).json({ error: 'Not Found', message: 'No recording' });
        return;
      }
      res.json(recording);
    } catch (e) {
      next(e);
    }
  }
);

export const transcriptionRouter = Router();

transcriptionRouter.get(
  '/meetings/:id/transcription',
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
      const recording = await recordingService.getRecording(req.params.id);
      if (!recording || recording.status !== 'ready') {
        res.status(400).json({ error: 'Bad Request', message: 'No ready recording to retry' });
        return;
      }
      await transcriptionService.runTranscriptionJob(recording.id);
      const transcription = await transcriptionService.getTranscription(req.params.id);
      res.json(transcription ?? { status: 'pending' });
    } catch (e) {
      next(e);
    }
  }
);
