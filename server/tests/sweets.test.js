const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');

require('dotenv').config();

// Connect to a test database before running tests
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/sweet_shop_test';
  await mongoose.connect(mongoUri);
});

// Clean up: Delete all data after each test to start fresh
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/sweets', () => {
  it('should deny access without a token', async () => {
    // Attempt to create a sweet without authentication
    const sweetData = {
      name: 'Gulab Jamun',
      price: 50,
      quantity: 100,
    };

    const res = await request(app).post('/api/sweets').send(sweetData);

    // Assertion: Expect 401 Unauthorized
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should deny access with an invalid token', async () => {
    // Attempt to create a sweet with a fake token
    const sweetData = {
      name: 'Rasgulla',
      price: 40,
      quantity: 80,
    };

    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', 'Bearer fake_invalid_token_12345')
      .send(sweetData);

    // Assertion: Expect 401 Unauthorized
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message');
  });
});
