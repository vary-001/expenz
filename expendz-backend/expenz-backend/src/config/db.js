// src/config/db.js

const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    console.log('\n========== MONGODB DEBUG ==========');
    console.log('Mongo URI:', env.MONGO_URI);
    console.log('===================================\n');

    const conn = await mongoose.connect(env.MONGO_URI);

    console.log(`✅ MongoDB Connected`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('\n❌ MongoDB Runtime Error');
      console.error(err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('\n⚠️ MongoDB disconnected');
    });

  } catch (error) {
    console.error('\n========== CONNECTION FAILED ==========');

    console.error('\n📌 Error Name:');
    console.error(error.name);

    console.error('\n📌 Error Message:');
    console.error(error.message);

    console.error('\n📌 Error Code:');
    console.error(error.code);

    console.error('\n📌 Error Cause:');
    console.error(error.cause);

    console.error('\n📌 Full Error Object:');
    console.dir(error, { depth: null });

    console.error('\n📌 Stack Trace:');
    console.error(error.stack);

    console.error('\n=======================================\n');

    process.exit(1);
  }
};

module.exports = connectDB;