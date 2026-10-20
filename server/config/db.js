const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env or run `npm run dev:memory`.');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
