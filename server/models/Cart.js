const mongoose = require('mongoose');

// Saved carts for logged-in users. Prices are NOT stored here; they are always
// read from the Product collection, so a cart can never carry a stale or forged price.
const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
