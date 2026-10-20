const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret') {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set to a long random value in production.');
  }
  // Development/test fallback: a per-process random secret (tokens reset on restart).
  jwtSecret = crypto.randomBytes(48).toString('hex');
  if (!isTest) {
    console.warn('[config] JWT_SECRET is not set; using a temporary secret. Logins reset when the server restarts.');
  }
}
if (isProduction && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

const config = {
  nodeEnv: NODE_ENV,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  currency: 'USD',
  // Game accounts are delivered digitally, so there is no delivery charge.
  deliveryFee: 0,
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'WIZHEX Admin',
    email: process.env.SEED_ADMIN_EMAIL || '',
    password: process.env.SEED_ADMIN_PASSWORD || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
};

module.exports = config;
