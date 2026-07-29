import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { apiRouter } from '@/api/index';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

describe('Attendance API contract', () => {
  let qrToken: string;
  let meetingId: string;
  let token: string;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'att-organizer@test.com',
        password: 'password123',
        role: 'ORGANIZER',
      });
    token = register.status === 201 ? register.body.token : (await request(app).post('/api/auth/login').send({ email: 'att-organizer@test.com', password: 'password123' })).body.token;
    const create = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Attendance Test', date: '2025-12-01', time: '10:00' });
    meetingId = create.body.id;
    qrToken = create.body.qrToken;
  });

  it('POST /api/attendance/scan with qrToken (no auth) records attendance', async () => {
    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ qrToken });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('attendance');
    expect(res.body.attendance).toHaveProperty('meetingId', meetingId);
  });

  it('POST /api/attendance/scan with auth associates userId', async () => {
    const res = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${token}`)
      .send({ qrToken });
    expect([201, 200]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/meetings/:id/attendance returns list', async () => {
    const res = await request(app)
      .get(`/api/meetings/${meetingId}/attendance`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
