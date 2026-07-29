/** Backend entry point */
import express from 'express';
import cors from 'cors';
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

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('  (accessible depuis le réseau local sur le port', PORT + ')');
  }
});
