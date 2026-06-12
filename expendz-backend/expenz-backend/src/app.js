// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── SECURITY ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS (allow browser & Postman to call our API) ───
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors());

// ─── BODY PARSER ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ───
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Expenz API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API ROUTES ───
app.use('/api/auth', authRoutes);

app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── ROOT ───
app.get('/', (req, res) => {
  res.json({
    name: 'Expenz API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      income: '/api/income',
      budgets: '/api/budgets',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
    },
  });
});

// ─── ERROR HANDLING (must be last) ───
app.use(notFound);
app.use(errorHandler);

module.exports = app;