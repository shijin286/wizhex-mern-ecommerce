const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5J0rQ1Ym8Ff0fC3yWZ6uR8aX4E3wK2W';

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Only whitelisted fields are used: a "role" sent by the client is ignored,
  // so nobody can register as an admin.
  const user = await User.create({
    name,
    email,
    passwordHash: await User.hashPassword(password),
  });

  res.status(201).json({ token: signToken(user._id), user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordOk = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !passwordOk) {
    // Same message for both cases so attackers can't discover which emails exist.
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json({ token: signToken(user._id), user });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
