const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
