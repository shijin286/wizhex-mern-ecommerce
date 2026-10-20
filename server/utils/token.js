const jwt = require('jsonwebtoken');
const config = require('../config/env');

// The token only carries the user id. Roles are always read from the database.
function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };
