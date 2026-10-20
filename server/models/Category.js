const mongoose = require('mongoose');

// In WIZHEX each category is a game (Clash of Clans, PUBG Mobile, ...).
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

module.exports = mongoose.model('Category', categorySchema);
