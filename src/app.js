const express = require('express');
const cors = require('cors');
const uploadRouter = require('./api/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/upload', uploadRouter);

module.exports = app;
