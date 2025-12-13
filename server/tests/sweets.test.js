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

describe('GET /api/sweets/search', () => {
  let token;

  // Setup: Create a user and some sweets before running search tests
  beforeEach(async () => {
    // 1. Create Admin User & Login
    const userData = { email: 'searcher@example.com', password: 'password123', role: 'user' };
    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email, password: userData.password
    });
    token = loginRes.body.token;

    // 2. Seed Database with Sweets (including Category)
    await Sweet.create([
      { name: 'Kaju Katli', category: 'Burfi', price: 1000, stock: 50 },
      { name: 'Rasgulla', category: 'Syrup', price: 50, stock: 100 },
      { name: 'Mysore Pak', category: 'Ghee', price: 60, stock: 20 }
    ]);
  });

  it('should search for sweets by name', async () => {
    const res = await request(app)
      .get('/api/sweets/search?name=Kaju')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toEqual('Kaju Katli');
  });

  it('should search for sweets by category', async () => {
    const res = await request(app)
      .get('/api/sweets/search?category=Syrup')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toEqual('Rasgulla');
  });

  it('should search for sweets by price range', async () => {
    // Search for sweets between price 40 and 70 (Should find Rasgulla 50 and Mysore Pak 60)
    const res = await request(app)
      .get('/api/sweets/search?minPrice=40&maxPrice=70')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(2);
  });
});

describe('PUT /api/sweets/:id', () => {
  let token;
  let sweetId;

  // Setup: Create a user and a sweet before testing update
  beforeEach(async () => {
    // 1. Login
    const userData = { email: 'manager@example.com', password: 'password123', role: 'admin' };
    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email, password: userData.password
    });
    token = loginRes.body.token;

    // 2. Create a sweet to update
    const sweet = await Sweet.create({
      name: 'Old Ladoo',
      price: 10,
      description: 'Stale sweet',
      stock: 5
    });
    sweetId = sweet._id;
  });

  it('should update a sweet details', async () => {
    const updatedData = {
      name: 'Fresh Ladoo',
      price: 20,
      description: 'Freshly made sweet'
    };

    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toEqual('Fresh Ladoo');
    expect(res.body.data.price).toEqual(20);
    
    // Verify in Database
    const dbSweet = await Sweet.findById(sweetId);
    expect(dbSweet.price).toEqual(20);
  });

  it('should return 404 if sweet not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/sweets/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost Sweet' });

    expect(res.statusCode).toEqual(404);
  });
});

describe('DELETE /api/sweets/:id', () => {
  let adminToken;
  let userToken;
  let sweetId;

  beforeEach(async () => {
    // 1. Create Admin
    await request(app).post('/api/auth/register').send({
      email: 'admin@example.com', password: 'password123', role: 'admin'
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com', password: 'password123'
    });
    adminToken = adminLogin.body.token;

    // 2. Create Regular User
    await request(app).post('/api/auth/register').send({
      email: 'user@example.com', password: 'password123', role: 'user'
    });
    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'user@example.com', password: 'password123'
    });
    userToken = userLogin.body.token;

    // 3. Create Sweet (using Admin token to be safe)
    const sweet = await Sweet.create({
      name: 'Badam Halwa',
      price: 200,
      stock: 10
    });
    sweetId = sweet._id;
  });

  it('should return 403 if non-admin tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403); // Forbidden
    // Verify sweet still exists
    const sweet = await Sweet.findById(sweetId);
    expect(sweet).toBeTruthy();
  });

  it('should allow admin to delete sweet', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    // Verify sweet is gone
    const sweet = await Sweet.findById(sweetId);
    expect(sweet).toBeNull();
  });
});

describe('POST /api/sweets/:id/purchase', () => {
  let token;
  let sweetId;

  beforeEach(async () => {
    // 1. Register and Login as a regular User
    const userData = { email: 'buyer@example.com', password: 'password123', role: 'user' };
    await request(app).post('/api/auth/register').send(userData);
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email, password: userData.password
    });
    token = loginRes.body.token;

    // 2. Create a Sweet with known stock (Stock: 5)
    // We use the model directly to avoid needing admin permissions for setup
    const sweet = await Sweet.create({
      name: 'Besan Ladoo',
      price: 20,
      stock: 5
    });
    sweetId = sweet._id;
  });

  it('should decrease sweet stock on purchase', async () => {
    // Buy 2 sweets
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toEqual(3); // 5 - 2 = 3

    // Verify in Database
    const dbSweet = await Sweet.findById(sweetId);
    expect(dbSweet.stock).toEqual(3);
  });

  it('should return 400 if out of stock', async () => {
    // Manually set stock to 0
    await Sweet.findByIdAndUpdate(sweetId, { stock: 0 });

    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/out of stock/i);
  });
});