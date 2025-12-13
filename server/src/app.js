const express = require('express');
const cors = require('cors');
const { register, loginUser } = require('./controllers/auth.controller');
const sweetRoutes = require('./routes/sweet.routes');

const app = express();

app.use(express.json());
app.use(cors());

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', loginUser);

// Sweet routes (Protected)
app.use('/api/sweets', sweetRoutes);

module.exports = app;