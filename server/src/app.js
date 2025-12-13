const express = require('express');
const cors = require('cors');
const { register, loginUser } = require('./controllers/auth.controller');

const app = express();

app.use(express.json());
app.use(cors());

// Use the controller
app.post('/api/auth/register', register);
app.post('/api/auth/login', loginUser);

module.exports = app;