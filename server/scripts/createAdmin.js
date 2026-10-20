// Development helper: creates (or promotes) the admin from SEED_ADMIN_* in server/.env.
// Usage: npm run create-admin
const config = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { ensureAdmin } = require('./seedData');

(async () => {
  try {
    if (config.isProduction && !process.argv.includes('--force')) {
      throw new Error('Refusing to run in production. Create admins through a secure process instead.');
    }
    await connectDB(config.mongoUri);
    const admin = await ensureAdmin();
    if (!admin) process.exitCode = 1;
  } catch (error) {
    console.error('[create-admin] Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
