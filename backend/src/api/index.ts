import { Router } from 'express';
import { authRouter } from './routes/auth.js';
import { meetingsRouter } from './routes/meetings.js';
import { attendanceRouter } from './routes/attendance.js';
import { recordingRouter, transcriptionRouter } from './routes/recording.js';
import { summaryRouter } from './routes/summary.js';
import { usersRouter } from './routes/users.js';
import { dashboardRouter } from './routes/dashboard.js';
import { trainingsRouter } from './routes/trainings.js';
import { errorHandler } from './errorHandler.js';
import { rateLimit } from './middleware/rateLimit.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'SmartReunion API' });
});

apiRouter.use('/auth', rateLimit({ windowMs: 15 * 60_000, max: 20 }), authRouter);
apiRouter.use('/meetings', meetingsRouter);
apiRouter.use('/attendance', rateLimit({ windowMs: 10 * 60_000, max: 30 }), attendanceRouter);
apiRouter.use(recordingRouter);
apiRouter.use(transcriptionRouter);
apiRouter.use(summaryRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/trainings', trainingsRouter);

apiRouter.use(errorHandler);
