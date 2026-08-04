import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roles.js';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../services/auth.js';

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  avatarUrl: z.string().url().max(2000).nullable().optional(),
  organizationName: z.string().trim().max(200).nullable().optional(),
  organizationLogoUrl: z.string().url().max(2000).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  defaultMeetingDuration: z.number().int().min(15).max(480).optional(),
  defaultLocation: z.string().trim().max(500).nullable().optional(),
  defaultOnlineUrl: z.string().url().max(2000).nullable().optional(),
  qrEnabled: z.boolean().optional(),
  confirmationEmailsEnabled: z.boolean().optional(),
  remindersEnabled: z.boolean().optional(),
  adminNotificationsEnabled: z.boolean().optional(),
  publicRegistrationEnabled: z.boolean().optional(),
  signatureRequired: z.boolean().optional(),
  phoneRequired: z.boolean().optional(),
  autoExportAttendanceEnabled: z.boolean().optional(),
});

const passwordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });
const deleteAccountSchema = z.object({ password: z.string().min(1) });

export const settingsRouter = Router();
settingsRouter.use(authMiddleware(), requireAuth, requireAdmin);

settingsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.sub }, select: { id: true, email: true, name: true, avatarUrl: true } }),
      prisma.adminSettings.upsert({ where: { userId: req.user.sub }, update: {}, create: { userId: req.user.sub } }),
    ]);
    if (!user) return res.status(404).json({ error: 'Not Found' });
    res.json({ ...settings, user });
  } catch (error) { next(error); }
});

settingsRouter.patch('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const body = settingsSchema.parse(req.body);
    const { name, avatarUrl, ...settingsData } = body;
    const [settings] = await prisma.$transaction([
      prisma.adminSettings.upsert({ where: { userId: req.user.sub }, update: settingsData, create: { userId: req.user.sub, ...settingsData } }),
      ...(name === undefined && avatarUrl === undefined ? [] : [prisma.user.update({ where: { id: req.user.sub }, data: { name, avatarUrl } })]),
    ]);
    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Bad Request', errors: error.flatten() });
    next(error);
  }
});

settingsRouter.post('/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const body = passwordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Bad Request', message: 'Mot de passe actuel incorrect' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Bad Request', errors: error.flatten() });
    next(error);
  }
});

settingsRouter.delete('/account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const body = deleteAccountSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return res.status(400).json({ error: 'Bad Request', message: 'Mot de passe incorrect' });
    }
    await prisma.user.delete({ where: { id: user.id } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Bad Request', errors: error.flatten() });
    next(error);
  }
});
