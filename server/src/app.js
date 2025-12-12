const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// TODO: Add Routes here later

module.exports = app;
