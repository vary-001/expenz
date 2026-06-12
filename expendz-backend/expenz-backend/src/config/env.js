// src/config/env.js
require('dotenv').config();

// Clean up MONGO_URI from unwanted quotes or trailing newlines (\n) injected by hosting environments
const rawMongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expenz';
const cleanMongoUri = rawMongoUri
  .replace(/^["']|["']$/g, '') // Strip outer single or double quotes
  .replace(/\\n/g, '')         // Strip literal string '\n'
  .trim();                     // Strip spaces or actual trailing newline blocks

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: cleanMongoUri,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

// Validate required env vars
const required = ['JWT_SECRET', 'MONGO_URI'];
required.forEach((key) => {
  if (!env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

module.exports = env;
