import cors from 'cors';
import express from 'express';
import { apiRouter } from './api/index.js';
import { errorHandler } from './api/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
