import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roles.js';
import * as trainingService from '../../services/training.js';

const trainingSchema = z.object({
  title: z.string().min(1).max(300), description: z.string().max(10000).optional(),
  mode: z.enum(['PRESENTIAL', 'ONLINE']), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/),
  trainer: z.string().max(200).optional(), location: z.string().max(500).optional(), onlineUrl: z.string().url().max(2000).optional(),
  presentationItems: z.array(z.object({ title: z.string().min(1).max(300), description: z.string().max(5000).optional(), durationMinutes: z.number().int().min(1).max(1440).optional(), resourceUrl: z.string().url().max(2000).optional() })).max(50).optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'PRESENTIAL' && !data.location) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Location is required for presential training', path: ['location'] });
  if (data.mode === 'ONLINE' && !data.onlineUrl) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Online URL is required for online training', path: ['onlineUrl'] });
});

const registrationSchema = z.object({
  qrToken: z.string().min(20).max(200), firstName: z.string().min(1).max(100), lastName: z.string().min(1).max(100),
  email: z.string().email().max(320), phone: z.string().min(5).max(50).optional(), cityCountry: z.string().max(200).optional(),
  organization: z.string().max(200).optional(), jobTitle: z.string().max(200).optional(), timezone: z.string().max(100).optional(),
  signature: z.string().min(100).max(2_000_000).optional(),
});

export const trainingsRouter = Router();

trainingsRouter.get('/:id/public', async (req: { params: { id: string }; query: unknown }, res: Response, next: NextFunction) => {
  try {
    const query = z.object({ qrToken: z.string().min(20).max(200) }).parse(req.query);
    const training = await trainingService.getPublicTraining(req.params.id, query.qrToken);
    if (!training || training.owner.adminSettings?.qrEnabled === false || training.owner.adminSettings?.publicRegistrationEnabled === false) return res.status(404).json({ error: 'Not Found', message: 'QR code invalid, expired or disabled' });
    const { owner, ...publicTraining } = training;
    res.json({ ...publicTraining, requirements: { phoneRequired: owner.adminSettings?.phoneRequired ?? false, signatureRequired: owner.adminSettings?.signatureRequired ?? true } });
  } catch (error) { next(error); }
});

trainingsRouter.post('/:id/register', async (req: { params: { id: string }; body: unknown }, res: Response, next: NextFunction) => {
  try {
    const body = registrationSchema.parse(req.body);
    const publicTraining = await trainingService.getPublicTraining(req.params.id, body.qrToken);
    if (!publicTraining || publicTraining.owner.adminSettings?.qrEnabled === false || publicTraining.owner.adminSettings?.publicRegistrationEnabled === false) return res.status(404).json({ error: 'Not Found', message: 'QR code invalid, expired or disabled' });
    if (publicTraining.owner.adminSettings?.phoneRequired && !body.phone) return res.status(400).json({ error: 'Bad Request', message: 'Phone required' });
    if (publicTraining.owner.adminSettings?.signatureRequired !== false && !body.signature) return res.status(400).json({ error: 'Bad Request', message: 'Signature required' });
    const result = await trainingService.registerForTraining({ trainingId: req.params.id, ...body, phone: body.phone || '', signature: body.signature || '' });
    if (!result.training || !result.registration) return res.status(404).json({ error: 'Not Found', message: 'QR code invalid, expired or disabled' });
    res.status(201).json({ id: result.registration.id, training: { title: result.training.title, mode: result.training.mode } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Bad Request', errors: error.flatten() });
    next(error);
  }
});

trainingsRouter.use(authMiddleware(), requireAuth, requireAdmin);

trainingsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => { try { if (!req.user) return; res.json(await trainingService.listTrainings(req.user.sub)); } catch (error) { next(error); } });
trainingsRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => { try { if (!req.user) return; const body = trainingSchema.parse(req.body); res.status(201).json(await trainingService.createTraining({ ...body, ownerId: req.user.sub })); } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ error: 'Bad Request', errors: error.flatten() }); next(error); } });
trainingsRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => { try { if (!req.user) return; const training = await trainingService.getTraining(req.params.id, req.user.sub); if (!training) return res.status(404).json({ error: 'Not Found' }); res.json(training); } catch (error) { next(error); } });
trainingsRouter.patch('/:id/qr', async (req: AuthRequest, res: Response, next: NextFunction) => { try { if (!req.user) return; const body = z.object({ qrActive: z.boolean() }).parse(req.body); const training = await trainingService.setQrActive(req.params.id, req.user.sub, body.qrActive); if (!training) return res.status(404).json({ error: 'Not Found' }); res.json(training); } catch (error) { next(error); } });
trainingsRouter.patch('/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => { try { if (!req.user) return; const body = z.object({ status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']) }).parse(req.body); const training = await trainingService.updateTrainingStatus(req.params.id, req.user.sub, body.status); if (!training) return res.status(404).json({ error: 'Not Found' }); res.json(training); } catch (error) { next(error); } });
trainingsRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const training = await trainingService.deleteTraining(req.params.id, req.user.sub);
    if (!training) return res.status(404).json({ error: 'Not Found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
