import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roles.js';
import * as userService from '../../services/user.js';
import { prisma } from '../../lib/prisma.js';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(200).optional(),
});

const updateUserSchema = z.object({
  name: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const usersRouter = Router();

usersRouter.use(authMiddleware(), requireAuth, requireAdmin);

usersRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const users = await userService.listParticipantsForAdmin(req.user.sub);
    res.json(users);
  } catch (e) {
    next(e);
  }
});

usersRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: 'Email already registered' });
      return;
    }
    if (!req.user) return;
    const user = await userService.createParticipant({
      email: body.email,
      password: body.password,
      name: body.name,
      managerId: req.user.sub,
    });
    res.status(201).json(user);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
      return;
    }
    next(e);
  }
});

usersRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const user = await userService.getParticipantForAdmin(req.params.id, req.user.sub);
    if (!user) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
});

usersRouter.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateUserSchema.parse(req.body);
    if (!req.user) return;
    const existing = await userService.getParticipantForAdmin(req.params.id, req.user.sub);
    if (!existing) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    const user = await userService.updateUser(req.params.id, {
      name: body.name,
      isActive: body.isActive,
      password: body.password,
    });
    res.json(user);
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
      return;
    }
    next(e);
  }
});

usersRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const existing = await userService.getParticipantForAdmin(req.params.id, req.user.sub);
    if (!existing) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    await userService.softDeactivateUser(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
