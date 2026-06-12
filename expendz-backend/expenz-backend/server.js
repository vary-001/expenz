// server.js
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Connect database first
    await connectDB();

    // Create HTTP server so we can attach an 'error' handler before/after listen
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║     EXPENZ Backend Server Running    ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`🚀 Mode:    ${env.NODE_ENV}`);
      console.log(`🌐 Port:    ${env.PORT}`);
      console.log(`🔗 URL:     http://localhost:${env.PORT}`);
      console.log(`🙂‍↔️ Health:  http://localhost:${env.PORT}/api/health`);
      console.log('');
    });

    // Handle listen errors (EADDRINUSE etc.)
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${env.PORT} is already in use. Please free the port or set PORT env var.`);
        process.exit(1);
      }
      console.error('❌ Server error:', err);
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();