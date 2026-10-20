const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    value: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false },
);

// A product is a single game-account listing.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    brand: { type: String, trim: true, maxlength: 60, default: '' }, // the game name
    price: { type: Number, required: true, min: 0 },
    originalPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(value) {
          return value === undefined || value === null || value >= this.price;
        },
        message: 'Original price must be greater than or equal to the price',
      },
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: {
      type: [{ type: String, trim: true, maxlength: 500 }],
      validate: { validator: (arr) => arr.length <= 10, message: 'A product can have at most 10 images' },
      default: [],
    },
    stock: { type: Number, required: true, min: 0, default: 1 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    soldCount: { type: Number, min: 0, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    // Deleted listings are hidden instead of removed, so past orders and reviews stay intact.
    isActive: { type: Boolean, default: true, index: true },
    specifications: { type: [specificationSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.index({ isActive: 1, category: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, soldCount: -1 });

module.exports = mongoose.model('Product', productSchema);
