import { Router } from 'express';
import { authRouter } from './routes/auth.js';
import { meetingsRouter } from './routes/meetings.js';
import { attendanceRouter } from './routes/attendance.js';
import { recordingRouter, transcriptionRouter } from './routes/recording.js';
import { summaryRouter } from './routes/summary.js';
import { usersRouter } from './routes/users.js';
import { errorHandler } from './errorHandler.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'SmartReunion API' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/meetings', meetingsRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use(recordingRouter);
apiRouter.use(transcriptionRouter);
apiRouter.use(summaryRouter);
apiRouter.use('/users', usersRouter);

apiRouter.use(errorHandler);
