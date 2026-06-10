// server.js
const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Connect database first
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║     EXPENZ Backend Server Running    ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`🚀 Mode:    ${env.NODE_ENV}`);
      console.log(`🌐 Port:    ${env.PORT}`);
      console.log(`🔗 URL:     http://localhost:${env.PORT}`);
      console.log(`💚 Health:  http://localhost:${env.PORT}/api/health`);
      console.log('');
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