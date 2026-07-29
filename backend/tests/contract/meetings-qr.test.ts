import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { apiRouter } from '@/api/index';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

describe('Meetings QR API contract', () => {
  let meetingId: string;
  let qrToken: string;
  let token: string;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'qr-organizer@test.com',
        password: 'password123',
        role: 'ORGANIZER',
      });
    token = register.status === 201 ? register.body.token : (await request(app).post('/api/auth/login').send({ email: 'qr-organizer@test.com', password: 'password123' })).body.token;
    const create = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'QR Test', date: '2025-12-01', time: '10:00' });
    meetingId = create.body.id;
    qrToken = create.body.qrToken;
  });

  it('GET /api/meetings/:id/qr returns qrToken and meetingId', async () => {
    const res = await request(app).get(`/api/meetings/${meetingId}/qr`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('qrToken', qrToken);
    expect(res.body).toHaveProperty('meetingId', meetingId);
  });

  it('GET /api/meetings/:id/qr?qrToken=... works without auth', async () => {
    const res = await request(app).get(`/api/meetings/${meetingId}/qr?qrToken=${qrToken}`);
    expect(res.status).toBe(200);
    expect(res.body.qrToken).toBe(qrToken);
  });
});
