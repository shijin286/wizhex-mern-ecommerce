const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');

function readBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

async function loadUserFromToken(token) {
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.');
  }
  // Always load the user (and role) fresh from the database: editing the token
  // or the frontend state can never grant extra privileges.
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('Your account no longer exists. Please log in again.');
  return user;
}

/** Requires a valid login. Sets req.user. */
const protect = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await loadUserFromToken(token);
  next();
});

/** Sets req.user when a valid token is present, but never blocks the request. */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (token) {
    try {
      req.user = await loadUserFromToken(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
});

/** Must run after `protect`. */
function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(ApiError.forbidden('Admin access only'));
  return next();
}

module.exports = { protect, optionalAuth, requireAdmin };
