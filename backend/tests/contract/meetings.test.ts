import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { apiRouter } from '@/api/index';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

describe('Meetings API contract', () => {
  let token: string;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'organizer@test.com',
        password: 'password123',
        name: 'Organizer',
        role: 'ORGANIZER',
      });
    if (register.status === 201) {
      token = register.body.token;
    } else {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'organizer@test.com', password: 'password123' });
      token = login.body.token;
    }
  });

  it('POST /api/meetings creates meeting and returns qrToken', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Meeting',
        date: '2025-12-01',
        time: '14:00',
        location: 'Room A',
        agenda: 'Agenda here',
        participantEmails: ['a@test.com'],
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('qrToken');
    expect(res.body.title).toBe('Test Meeting');
    expect(res.body.participants).toHaveLength(1);
  });

  it('GET /api/meetings returns list', async () => {
    const res = await request(app)
      .get('/api/meetings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
