import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { apiRouter } from '@/api/index';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

describe('Summary API contract', () => {
  let meetingId: string;
  let token: string;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ email: 'sum-organizer@test.com', password: 'password123', role: 'ORGANIZER' });
    token = register.status === 201 ? register.body.token : (await request(app).post('/api/auth/login').send({ email: 'sum-organizer@test.com', password: 'password123' })).body.token;
    const create = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Summary Test', date: '2025-12-01', time: '10:00' });
    meetingId = create.body.id;
  });

  it('GET /api/meetings/:id/summary returns 404 when no summary', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/summary`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('GET /api/meetings/:id/report?format=pdf returns 404 when no summary', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/report?format=pdf`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('GET /api/meetings/:id/report?format=docx returns 404 when no summary', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/report?format=docx`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
