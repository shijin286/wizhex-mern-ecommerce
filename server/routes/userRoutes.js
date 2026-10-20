const express = require('express');
const { updateProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

router.use(protect);

router.put(
  '/profile',
  validate([
    rules.name().optional(),
    rules.email().optional(),
    rules.body('currentPassword').optional().isString(),
    rules.newPassword('newPassword').optional(),
  ]),
  updateProfile,
);

router.post('/addresses', validate(rules.address()), addAddress);
router.put('/addresses/:addressId', validate([rules.mongoId('addressId'), ...rules.address(true)]), updateAddress);
router.delete('/addresses/:addressId', validate([rules.mongoId('addressId')]), deleteAddress);

module.exports = router;
