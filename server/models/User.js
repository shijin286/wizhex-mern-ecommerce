const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    line1: { type: String, required: true, trim: true, maxlength: 120 },
    line2: { type: String, trim: true, maxlength: 120, default: '' },
    city: { type: String, required: true, trim: true, maxlength: 60 },
    state: { type: String, required: true, trim: true, maxlength: 60 },
    postalCode: { type: String, required: true, trim: true, maxlength: 12 },
    country: { type: String, required: true, trim: true, maxlength: 60 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // Never returned by default; must be explicitly selected for login checks.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: { type: [addressSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
