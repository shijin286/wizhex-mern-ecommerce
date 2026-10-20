const path = require('path');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const config = require('../config/env');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');

// The storefront's sample catalogue is the single source of truth for seed data,
// so "Preview mode" and the real database always show the same listings.
const CATALOG_FILE = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'demoCatalog.js');

async function loadCatalog() {
  return import(pathToFileURL(CATALOG_FILE).href);
}

/** Creates or updates the development admin from SEED_ADMIN_* env vars. */
async function ensureAdmin({ log = console.log } = {}) {
  const { name, email, password } = config.seedAdmin;
  if (!email || !password) {
    log('[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin account.');
    return null;
  }
  const passwordHash = await User.hashPassword(password);
  const admin = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), passwordHash, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  log(`[seed] Admin account ready: ${admin.email}`);
  return admin;
}

/**
 * Resets store data (games, listings, reviews, carts, wishlists, orders) and
 * inserts the sample catalogue. Regular user accounts are kept.
 */
async function seedDatabase({ log = console.log, withAdmin = true } = {}) {
  if (config.isProduction && !process.argv.includes('--force')) {
    throw new Error('Refusing to seed a production database. Re-run with --force if you really mean it.');
  }

  const catalog = await loadCatalog();

  await Promise.all([
    Review.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // Games (categories), inserted in display order.
  const categories = [];
  for (const { _id, ...category } of catalog.DEMO_CATEGORIES) {
    // eslint-disable-next-line no-await-in-loop
    categories.push(await Category.create(category));
  }
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c._id]));

  // Listings.
  const products = await Product.insertMany(
    catalog.DEMO_PRODUCTS.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice,
      category: categoryIdBySlug.get(p.category.slug),
      images: p.images,
      stock: p.stock,
      soldCount: p.soldCount,
      featured: p.featured,
      specifications: p.specifications,
    })),
  );

  // Back-date listings so "Newest" sorting matches the catalogue (native driver,
  // because Mongoose treats createdAt as immutable).
  await Product.collection.bulkWrite(
    products.map((doc, i) => ({
      updateOne: { filter: { _id: doc._id }, update: { $set: { createdAt: new Date(catalog.DEMO_PRODUCTS[i].createdAt) } } },
    })),
  );

  // Demo reviewer accounts (random passwords, they can't be logged into).
  const reviewerByName = new Map();
  const sampleReviews = catalog.DEMO_PRODUCTS.flatMap((p, i) =>
    catalog.getDemoReviews(p._id).map((review) => ({ ...review, productId: products[i]._id })),
  );
  const reviewerNames = [...new Set(sampleReviews.map((r) => r.user.name))];
  for (const [i, name] of reviewerNames.entries()) {
    const email = `reviewer${i + 1}@wizhex.test`;
    // eslint-disable-next-line no-await-in-loop
    const passwordHash = await User.hashPassword(crypto.randomBytes(24).toString('hex'));
    // eslint-disable-next-line no-await-in-loop
    const user = await User.findOneAndUpdate(
      { email },
      { name, email, passwordHash, role: 'user' },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    reviewerByName.set(name, user._id);
  }

  const reviews = await Review.insertMany(
    sampleReviews.map((r) => ({
      product: r.productId,
      user: reviewerByName.get(r.user.name),
      rating: r.rating,
      comment: r.comment,
    })),
  );
  await Promise.all(products.map((p) => Review.syncProductRating(p._id)));

  const admin = withAdmin ? await ensureAdmin({ log }) : null;

  log(`[seed] Inserted ${categories.length} games, ${products.length} listings and ${reviews.length} reviews.`);
  return { categories, products, reviews, admin };
}

module.exports = { seedDatabase, ensureAdmin, loadCatalog };
