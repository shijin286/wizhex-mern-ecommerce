const mongoose = require('mongoose');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

const health = (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', db: dbStates[mongoose.connection.readyState] || 'unknown' });
};

// Responds the same whether or not the email was already subscribed,
// so the endpoint can't be used to check who is on the list.
const subscribe = asyncHandler(async (req, res) => {
  await NewsletterSubscriber.updateOne({ email: req.body.email }, { $setOnInsert: { email: req.body.email } }, { upsert: true });
  res.json({ message: "You're subscribed! Watch your inbox for account deals." });
});

const contact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ message: 'Thanks! Our team will get back to you within 24 hours.' });
});

module.exports = { health, subscribe, contact };
