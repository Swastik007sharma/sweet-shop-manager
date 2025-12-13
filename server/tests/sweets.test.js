const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Sweet = require('../src/models/sweet.model');

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

  it('should create a new sweet with valid data', async () => {
    // Setup: Register a user and get a valid token
    const userData = {
      email: 'shopowner@example.com',
      password: 'secure123',
      role: 'admin',
    };

    // Register the user
    await request(app).post('/api/auth/register').send(userData);

    // Login to get the token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    const token = loginRes.body.token;

    // Data: Define a sweet object
    const sweetData = {
      name: 'Gulab Jamun',
      price: 50,
      description: 'Delicious sweet soaked in sugar syrup',
    };

    // Execution: POST to /api/sweets with Authorization header
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(sweetData);

    // Assertion: Expect 201 Created
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');

    // Verification: Query the Sweet model to ensure it's in the database
    const sweetInDb = await Sweet.findOne({ name: 'Gulab Jamun' });
    expect(sweetInDb).toBeTruthy();
    expect(sweetInDb.name).toEqual('Gulab Jamun');
    expect(sweetInDb.price).toEqual(50);
    expect(sweetInDb.description).toEqual('Delicious sweet soaked in sugar syrup');
  });

  it('should return 400 when name is missing', async () => {
    // Setup: Register and login to get token
    const userData = {
      email: 'testuser@example.com',
      password: 'password123',
      role: 'admin',
    };

    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    const token = loginRes.body.token;

    // Data: Missing name field
    const invalidData = {
      price: 30,
      description: 'Some description',
    };

    // Execution: Attempt to create sweet without name
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidData);

    // Assertion: Expect 400 Bad Request
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/name/i);
  });

  it('should return 400 when price is missing', async () => {
    // Setup: Register and login to get token
    const userData = {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    };

    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    const token = loginRes.body.token;

    // Data: Missing price field
    const invalidData = {
      name: 'Jalebi',
      description: 'Crispy and sweet',
    };

    // Execution: Attempt to create sweet without price
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidData);

    // Assertion: Expect 400 Bad Request
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/price/i);
  });
});

describe('GET /api/sweets', () => {
  it('should return 401 if user is not logged in', async () => {
    const res = await request(app).get('/api/sweets');
    expect(res.statusCode).toEqual(401);
  });

  it('should return 200 and all sweets for logged in user', async () => {
    // 1. Arrange: Create a user and get token
    const userData = { email: 'viewer@example.com', password: 'password123', role: 'user' };
    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email, password: userData.password
    });
    const token = loginRes.body.token;

    // 2. Arrange: Seed the database with a sweet
    await Sweet.create({
      name: 'Mysore Pak',
      price: 60,
      description: 'Ghee based sweet',
      quantity: 10
    });

    // 3. Act: Request with token
    const res = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${token}`);

    // 4. Assert
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    // Depending on your API structure, checks if data is array
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toEqual('Mysore Pak');
  });
});