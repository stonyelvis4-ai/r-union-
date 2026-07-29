import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { apiRouter } from '@/api/index';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

describe('Recording & Transcription API contract', () => {
  let meetingId: string;
  let token: string;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ email: 'rec-organizer@test.com', password: 'password123', role: 'ORGANIZER' });
    token = register.status === 201 ? register.body.token : (await request(app).post('/api/auth/login').send({ email: 'rec-organizer@test.com', password: 'password123' })).body.token;
    const create = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Recording Test', date: '2025-12-01', time: '10:00' });
    meetingId = create.body.id;
  });

  it('POST /api/meetings/:id/recording/start returns recordingId', async () => {
    const res = await request(app)
      .post(`/api/meetings/${meetingId}/recording/start`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('recordingId');
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/meetings/:id/recording returns recording', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/recording`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status');
  });

  it('GET /api/meetings/:id/transcription returns status', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/transcription`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});
