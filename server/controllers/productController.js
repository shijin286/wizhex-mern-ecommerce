const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, isValidObjectId, parsePagination, slugify } = require('../utils/helpers');

const SORTS = {
  newest: { createdAt: -1 },
  popular: { soldCount: -1, createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
  rating: { rating: -1, reviewCount: -1 },
};

const EDITABLE_FIELDS = [
  'name',
  'description',
  'brand',
  'price',
  'originalPrice',
  'images',
  'stock',
  'featured',
  'specifications',
];

async function resolveCategoryId(value) {
  if (!value) return null;
  const query = isValidObjectId(value) ? { _id: value } : { slug: String(value).toLowerCase() };
  const category = await Category.findOne(query).select('_id');
  return category?._id || null;
}

async function uniqueSlug(name, excludeId) {
  const base = slugify(name) || 'listing';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// GET /api/products
const listProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, inStock, featured, sort } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  // Admins can include hidden (deleted) listings in the dashboard.
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };

  if (search) {
    const pattern = new RegExp(escapeRegex(String(search).trim().slice(0, 100)), 'i');
    filter.$or = [{ name: pattern }, { brand: pattern }, { description: pattern }];
  }

  if (category) {
    const categoryId = await resolveCategoryId(category);
    if (!categoryId) return res.json({ products: [], page: 1, pages: 1, total: 0 });
    filter.category = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (featured === 'true') filter.featured = true;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] || SORTS.newest)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return res.json({ products, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Product not found');
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product || (!product.isActive && req.user?.role !== 'admin')) throw ApiError.notFound('Product not found');
  res.json({ product });
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const categoryId = await resolveCategoryId(req.body.category);
  if (!categoryId) throw ApiError.badRequest('Please choose a valid game category', { category: 'Unknown category' });

  const data = Object.fromEntries(EDITABLE_FIELDS.filter((f) => req.body[f] !== undefined).map((f) => [f, req.body[f]]));
  const product = await Product.create({
    ...data,
    category: categoryId,
    slug: await uniqueSlug(data.name),
  });
  await product.populate('category', 'name slug');
  res.status(201).json({ product });
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Product not found');
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.category !== undefined) {
    const categoryId = await resolveCategoryId(req.body.category);
    if (!categoryId) throw ApiError.badRequest('Please choose a valid game category', { category: 'Unknown category' });
    product.category = categoryId;
  }
  if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);
  if (req.body.name !== undefined) product.slug = await uniqueSlug(product.name, product._id);

  await product.save();
  await product.populate('category', 'name slug');
  res.json({ product });
});

// DELETE /api/products/:id (admin) — hides the listing, keeping order history intact.
const deleteProduct = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Product not found');
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ message: 'Listing deleted' });
});

// GET /api/products/:id/reviews
const listReviews = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Product not found');
  const reviews = await Review.find({ product: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name');
  res.json({ reviews });
});

// POST /api/products/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Product not found');
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  let review;
  try {
    review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict('You have already reviewed this listing');
    throw error;
  }

  await Review.syncProductRating(product._id);
  await review.populate('user', 'name');
  res.status(201).json({ review });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listReviews,
  createReview,
};
