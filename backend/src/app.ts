import cors from 'cors';
import express from 'express';
import { apiRouter } from './api/index.js';
import { errorHandler } from './api/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }));
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
