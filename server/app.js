const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Behind a proxy (Render, Railway, Nginx) so rate limiting sees real client IPs.
if (config.isProduction) app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server requests (no Origin header) and listed frontends.
      if (!origin || config.clientUrls.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);
app.use(compression());
app.use(express.json({ limit: '100kb' }));
// Strips keys like "$gt" from input to block NoSQL operator injection.
app.use(mongoSanitize());
if (!config.isTest) app.use(morgan(config.isProduction ? 'combined' : 'dev'));

app.use('/api', apiLimiter);
app.use('/api', require('./routes/miscRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
