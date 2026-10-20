const { body, param, query } = require('express-validator');

// Reusable validation rules (mirrors client/src/utils/validation.js).
const email = (field = 'email') =>
  body(field)
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Enter a valid email address')
    .isLength({ max: 254 });

const name = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters');

const newPassword = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must include at least one letter')
    .matches(/\d/)
    .withMessage('Password must include at least one number');

const mongoId = (field = 'id', where = param) => where(field).isMongoId().withMessage(`Invalid ${field}`);

const productQuery = [
  query('search').optional().isString().isLength({ max: 100 }),
  query('category').optional().isString().isLength({ max: 80 }),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('sort').optional().isIn(['newest', 'popular', 'price_asc', 'price_desc', 'rating']).withMessage('Invalid sort option'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('inStock').optional().isIn(['true', 'false']),
  query('featured').optional().isIn(['true', 'false']),
];

const productBody = (isUpdate = false) => {
  const opt = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    opt(body('name')).trim().isLength({ min: 3, max: 140 }).withMessage('Name must be 3–140 characters'),
    opt(body('description')).trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10–3000 characters'),
    opt(body('category')).isString().notEmpty().withMessage('Category is required'),
    opt(body('price')).isFloat({ min: 0, max: 100000 }).withMessage('Price must be between 0 and 100,000').toFloat(),
    body('originalPrice').optional({ values: 'null' }).isFloat({ min: 0, max: 100000 }).toFloat(),
    opt(body('stock')).isInt({ min: 0, max: 10000 }).withMessage('Stock must be a whole number ≥ 0').toInt(),
    body('brand').optional().trim().isLength({ max: 60 }),
    body('featured').optional().isBoolean().toBoolean(),
    body('isActive').optional().isBoolean().toBoolean(),
    body('images').optional().isArray({ max: 10 }).withMessage('Up to 10 images'),
    body('images.*').optional().isString().trim().isLength({ min: 1, max: 500 }),
    body('specifications').optional().isArray({ max: 20 }),
    body('specifications.*.label').optional().isString().trim().isLength({ min: 1, max: 60 }),
    body('specifications.*.value').optional().isString().trim().isLength({ min: 1, max: 200 }),
  ];
};

const address = (isUpdate = false) => {
  const opt = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    opt(body('fullName')).trim().isLength({ min: 2, max: 80 }).withMessage('Full name is required'),
    opt(body('phone')).trim().matches(/^\+?[0-9\s-]{7,20}$/).withMessage('Enter a valid phone number'),
    opt(body('line1')).trim().isLength({ min: 3, max: 120 }).withMessage('Address line 1 is required'),
    body('line2').optional().trim().isLength({ max: 120 }),
    opt(body('city')).trim().isLength({ min: 2, max: 60 }).withMessage('City is required'),
    opt(body('state')).trim().isLength({ min: 2, max: 60 }).withMessage('State is required'),
    opt(body('postalCode')).trim().matches(/^[A-Za-z0-9\s-]{3,12}$/).withMessage('Enter a valid postal code'),
    opt(body('country')).trim().isLength({ min: 2, max: 60 }).withMessage('Country is required'),
    body('isDefault').optional().isBoolean().toBoolean(),
  ];
};

module.exports = { email, name, newPassword, mongoId, productQuery, productBody, address, body, param, query };
