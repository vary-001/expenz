// src/config/db.js
const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    // Debug: Show partial URI (hide password)
    const uri = env.MONGO_URI;
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${maskedUri}`);

    // Validate URI format
    if (!uri || !uri.startsWith('mongodb')) {
      throw new Error('Invalid MongoDB URI. Must start with mongodb:// or mongodb+srv://');
    }

    if (uri.includes('""') || uri.includes('<') || uri.includes('>')) {
      throw new Error('MongoDB URI contains placeholder text or empty quotes. Please replace <db_password> with your actual password.');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 sec timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('');
    console.error('❌ ═══════════════════════════════════════');
    console.error('❌ MONGODB CONNECTION FAILED');
    console.error('❌ ═══════════════════════════════════════');
    console.error(`❌ Error: ${error.message}`);
    console.error('');
    console.error('💡 COMMON FIXES:');
    console.error('   1. Check MONGO_URI is set correctly in environment variables');
    console.error('   2. Replace <db_password> with your actual password');
    console.error('   3. URL-encode special characters in password');
    console.error('   4. Allow 0.0.0.0/0 in MongoDB Atlas Network Access');
    console.error('   5. Verify database user exists and has correct permissions');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;