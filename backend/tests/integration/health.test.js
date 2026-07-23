import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('GET /api/health', () => {
  it('deve retornar 200', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
