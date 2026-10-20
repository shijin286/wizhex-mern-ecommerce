const mongoose = require('mongoose');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

// Escape user input before using it inside a RegExp (prevents ReDoS / regex injection).
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

function parsePagination(query, { defaultLimit = 12, maxLimit = 50 } = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { slugify, escapeRegex, isValidObjectId, parsePagination };
