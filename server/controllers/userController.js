const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const MAX_ADDRESSES = 5;
const ADDRESS_FIELDS = ['fullName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country', 'isDefault'];

const pickAddress = (body) =>
  Object.fromEntries(ADDRESS_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

function ensureSingleDefault(user, defaultId) {
  if (!defaultId) {
    if (user.addresses.length && !user.addresses.some((a) => a.isDefault)) user.addresses[0].isDefault = true;
    return;
  }
  user.addresses.forEach((address) => {
    address.isDefault = String(address._id) === String(defaultId);
  });
}

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');

  if (name !== undefined) user.name = name;

  if (email !== undefined && email !== user.email) {
    if (await User.exists({ email, _id: { $ne: user._id } })) {
      throw ApiError.conflict('An account with this email already exists');
    }
    user.email = email;
  }

  if (newPassword) {
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      throw ApiError.badRequest('Your current password is incorrect', { currentPassword: 'Incorrect password' });
    }
    user.passwordHash = await User.hashPassword(newPassword);
  }

  await user.save();
  res.json({ user });
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.addresses.length >= MAX_ADDRESSES) {
    throw ApiError.badRequest(`You can save up to ${MAX_ADDRESSES} addresses`);
  }
  user.addresses.push(pickAddress(req.body));
  const added = user.addresses[user.addresses.length - 1];
  ensureSingleDefault(user, req.body.isDefault ? added._id : null);
  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');
  address.set(pickAddress(req.body));
  ensureSingleDefault(user, req.body.isDefault ? address._id : null);
  await user.save();
  res.json({ addresses: user.addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');
  address.deleteOne();
  ensureSingleDefault(user, null);
  await user.save();
  res.json({ addresses: user.addresses });
});

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress };
