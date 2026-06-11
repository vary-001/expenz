const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // 1. Connect to the database first
    await connectDB();

    // 2. Define Port and Host
    // We bind to '0.0.0.0' to ensure the server is accessible from the network
    const PORT = env.PORT || process.env.PORT || 10000;
    const HOST = '0.0.0.0';

    // 3. Start listening
    const server = app.listen(PORT, HOST, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║     EXPENZ Backend Server Running      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`🚀 Mode:    ${env.NODE_ENV}`);
      console.log(`🌐 Port:    ${PORT}`);
      console.log(`🔗 URL:     http://localhost:${PORT}`);
      console.log(`🙂‍↔️ Health:  http://${HOST}:${PORT}/api/health`);
      console.log('');
    });

    // 4. Graceful shutdown logic
    const shutdown = (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 5. Handle unexpected errors
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