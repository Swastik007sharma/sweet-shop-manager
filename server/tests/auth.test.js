const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model'); // <--- This file does not exist yet!

require('dotenv').config();

// Connect to a test database before running tests
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/sweet_shop_test';
  await mongoose.connect(mongoUri);
});

// Clean up: Delete all users after each test to start fresh
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('should create a user in the database', async () => {
    const newUser = {
      email: 'realuser@example.com',
      password: 'password123',
      role: 'admin',
    };

    // 1. Send Request
    const res = await request(app).post('/api/auth/register').send(newUser);

    // 2. Check Response
    expect(res.statusCode).toEqual(201);

    // 3. THE REAL CHECK: Verify user is in MongoDB
    const userInDb = await User.findOne({ email: 'realuser@example.com' });
    expect(userInDb).toBeTruthy();
    expect(userInDb.email).toEqual('realuser@example.com');
  });
});

describe('POST /api/auth/login', () => {
  it('should return 200 and a token for valid credentials', async () => {
    // Setup: Register a user first
    const userData = {
      email: 'testuser@example.com',
      password: 'securePassword123',
      role: 'user',
    };

    await request(app).post('/api/auth/register').send(userData);

    // Execution: Attempt login with correct credentials
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'securePassword123',
    });

    // Assertion: Expect success with token
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  it('should return 401 for invalid credentials (wrong password)', async () => {
    // Setup: Register a user first
    const userData = {
      email: 'anotheruser@example.com',
      password: 'correctPassword',
      role: 'user',
    };

    await request(app).post('/api/auth/register').send(userData);

    // Execution: Attempt login with wrong password
    const res = await request(app).post('/api/auth/login').send({
      email: 'anotheruser@example.com',
      password: 'wrongPassword',
    });

    // Assertion: Expect 401 Unauthorized
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/invalid|credentials|unauthorized/i);
  });
});