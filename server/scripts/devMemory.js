// Zero-setup development: starts a temporary in-memory MongoDB, seeds it and
// runs the API. Data is lost when the process stops.
// Usage: npm run dev:memory
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('../config/env');
const { start } = require('../server');
const { seedDatabase } = require('./seedData');

(async () => {
  if (config.isProduction) throw new Error('dev:memory is for development only.');
  console.log('[dev:memory] Starting in-memory MongoDB (first run downloads it, please wait)...');
  const mongo = await MongoMemoryServer.create();
  const server = await start(mongo.getUri('wizhex'));
  await seedDatabase();

  const stop = async () => {
    server.close();
    await mongo.stop();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
})().catch((error) => {
  console.error('[dev:memory] Failed:', error);
  process.exit(1);
});
