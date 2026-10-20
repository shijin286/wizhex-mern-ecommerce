const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/** Recomputes a product's average rating and review count from its reviews. */
reviewSchema.statics.syncProductRating = async function syncProductRating(productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await mongoose.model('Product').updateOne(
    { _id: productId },
    {
      rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
      reviewCount: stats ? stats.count : 0,
    },
  );
};

module.exports = mongoose.model('Review', reviewSchema);
