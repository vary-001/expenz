// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());

// CORS - allow our frontend
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Expenz API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Expenz API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// 404 + Error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;