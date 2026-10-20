const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { slugify } = require('../utils/helpers');

const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ createdAt: 1, name: 1 }).lean(),
    Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    categories: categories.map(({ __v, ...category }) => ({
      ...category,
      productCount: countById.get(String(category._id)) || 0,
    })),
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description = '', image = '' } = req.body;
  const slug = slugify(req.body.slug || name);
  if (await Category.exists({ $or: [{ name }, { slug }] })) {
    throw ApiError.conflict('A category with this name already exists');
  }
  const category = await Category.create({ name, slug, description, image });
  res.status(201).json({ category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  ['name', 'description', 'image'].forEach((field) => {
    if (req.body[field] !== undefined) category[field] = req.body[field];
  });
  if (req.body.slug !== undefined) category.slug = slugify(req.body.slug);

  await category.save();
  res.json({ category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const inUse = await Product.countDocuments({ category: category._id, isActive: true });
  if (inUse > 0) {
    throw ApiError.conflict(`This game still has ${inUse} active listing(s). Move or delete them first.`);
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
