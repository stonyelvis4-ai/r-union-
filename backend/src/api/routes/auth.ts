import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { hashPassword, issueToken } from '../../services/auth.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getEnv } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import * as emailService from '../../services/email.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: 'Email already registered' });
      return;
    }
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: 'PARTICIPANT',
      },
    });
    const secret = getEnv().JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' });
      return;
    }
    const token = issueToken(
      { sub: user.id, email: user.email, role: user.role },
      secret
    );

    emailService
      .sendWelcomeEmail(user.email, user.name ?? undefined)
      .catch((e) => console.error('Welcome email error:', e));

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
      return;
    }
    next(e);
  }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }
    const { verifyPassword } = await import('../../services/auth.js');
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }
    const secret = getEnv().JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server misconfiguration' });
      return;
    }
    const token = issueToken(
      { sub: user.id, email: user.email, role: user.role },
      secret
    );
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: 'Bad Request', errors: e.flatten() });
      return;
    }
    next(e);
  }
});

authRouter.get(
  '/me',
  authMiddleware(),
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return;
      const user = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });
      if (!user || !user.isActive) {
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (e) {
      next(e);
    }
  }
);
