const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidObjectId } = require('../utils/helpers');

async function wishlistProducts(userId) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    match: { isActive: true },
    populate: { path: 'category', select: 'name slug' },
  });
  return (wishlist?.products || []).filter(Boolean).reverse(); // newest first
}

const getWishlist = asyncHandler(async (req, res) => {
  res.json({ products: await wishlistProducts(req.user._id) });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId) || !(await Product.exists({ _id: productId, isActive: true }))) {
    throw ApiError.notFound('Product not found');
  }
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { upsert: true, setDefaultsOnInsert: true },
  );
  res.json({ products: await wishlistProducts(req.user._id) });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) throw ApiError.notFound('Product not found');
  await Wishlist.updateOne({ user: req.user._id }, { $pull: { products: productId } });
  res.json({ products: await wishlistProducts(req.user._id) });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
