// Runs before every test file (see "setupFiles" in package.json).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-definitely-longer-than-32-characters';
process.env.ALLOW_SIMULATED_PAYMENTS = 'true';
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';
