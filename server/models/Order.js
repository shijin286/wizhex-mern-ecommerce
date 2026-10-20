const mongoose = require('mongoose');

// Snapshot of the product at purchase time. Prices here are set by the server
// from the database, never from the client.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    game: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

// Game accounts are delivered digitally, so we collect contact details for the
// handover instead of a shipping address.
const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 60 },
    preferredContact: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: { validator: (arr) => arr.length > 0, message: 'An order needs at least one item' },
    },
    contact: { type: contactSchema, required: true },
    currency: { type: String, default: 'USD' },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['razorpay', 'simulated'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payment: {
      provider: { type: String, default: '' },
      providerOrderId: { type: String, default: '' },
      providerPaymentId: { type: String, default: '' },
      isTest: { type: Boolean, default: true },
      paidAt: Date,
    },
    // Client-generated key that makes "Place order" safe to retry without duplicates.
    idempotencyKey: { type: String, required: true, maxlength: 100 },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

orderSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
