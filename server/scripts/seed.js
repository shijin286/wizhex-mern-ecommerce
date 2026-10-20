// Usage: npm run seed   (reads MONGODB_URI and SEED_ADMIN_* from server/.env)
const config = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

(async () => {
  try {
    await connectDB(config.mongoUri);
    await seedDatabase();
    console.log('[seed] Done.');
  } catch (error) {
    console.error('[seed] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
