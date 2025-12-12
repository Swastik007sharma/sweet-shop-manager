const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/register', () => {
  it('should return 201 and success message when user registers', async () => {
    // 1. Mock Data
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    };

    // 2. Send Request
    const res = await request(app).post('/api/auth/register').send(newUser);

    // 3. Expect Success (This will fail initially because route is 404)
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });
});
