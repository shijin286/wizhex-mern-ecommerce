const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

const categoryBody = (isUpdate) => {
  const opt = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    opt(rules.body('name')).trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    rules.body('slug').optional().trim().isLength({ min: 2, max: 80 }),
    rules.body('description').optional().trim().isLength({ max: 300 }),
    rules.body('image').optional().trim().isLength({ max: 500 }),
  ];
};

router.get('/', listCategories);
router.post('/', protect, requireAdmin, validate(categoryBody(false)), createCategory);
router.put('/:id', protect, requireAdmin, validate([rules.mongoId(), ...categoryBody(true)]), updateCategory);
router.delete('/:id', protect, requireAdmin, validate([rules.mongoId()]), deleteCategory);

module.exports = router;
