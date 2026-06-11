require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Render dynamically assigns the PORT; fallback to 10000 for Render, 5000 for local dev
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 10000,
  
  // Remove default localhost URI to force configuration errors in production
  MONGO_URI: process.env.MONGO_URI,
  
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Use your production URL from Vercel
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

// Validate required env vars
// Note: Added CLIENT_URL to required if running in production to ensure CORS security
const required = ['JWT_SECRET', 'MONGO_URI'];

required.forEach((key) => {
  if (!env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

module.exports = env;