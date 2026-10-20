const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Turns raw { product, quantity } pairs into a clean cart:
 * merges duplicates, drops unknown / hidden / sold-out listings,
 * and clamps each quantity to the available stock.
 */
async function normalizeItems(rawItems) {
  const merged = new Map();
  rawItems.forEach(({ product, quantity }) => {
    const id = String(product);
    merged.set(id, (merged.get(id) || 0) + Number(quantity));
  });

  const products = await Product.find({ _id: { $in: [...merged.keys()] }, isActive: true }).populate(
    'category',
    'name slug',
  );

  return products
    .filter((product) => product.stock > 0)
    .map((product) => ({
      product,
      quantity: Math.max(1, Math.min(merged.get(String(product._id)), product.stock, 99)),
    }));
}

const toResponse = (items) => items.map(({ product, quantity }) => ({ product, quantity }));

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const items = await normalizeItems(cart?.items || []);
  res.json({ items: toResponse(items) });
});

// PUT /api/cart — replaces the whole cart.
const replaceCart = asyncHandler(async (req, res) => {
  const items = await normalizeItems(req.body.items || []);
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: items.map(({ product, quantity }) => ({ product: product._id, quantity })) },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ items: toResponse(items) });
});

module.exports = { getCart, replaceCart, normalizeItems };
