const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

async function start(mongoUri = config.mongoUri) {
  await connectDB(mongoUri);
  const server = app.listen(config.port, () => {
    console.log(`[server] WIZHEX API running on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

if (require.main === module) {
  start().catch((error) => {
    console.error('[server] Failed to start:', error.message);
    process.exit(1);
  });
}

module.exports = { start };
