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
// Helmet helps secure your app by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ───
// Configured to allow cross-origin requests, essential for frontend-to-backend communication
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// Handle preflight requests
app.options('*', cors());

// ─── BODY PARSER ───
// Increased limit to 10mb to handle potential image/data uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ───
// Only use morgan in development to keep production logs clean
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── HEALTH CHECK ───
// This endpoint is what cloud platforms use to verify your server is alive
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
      transactions: '/api/expenses', // Corrected path
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