const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

let mongo;

async function startDB() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri('wizhex-test'));
}

async function stopDB() {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
}

async function clearDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

const api = () => request(app);

let counter = 0;
async function registerUser(overrides = {}) {
  counter += 1;
  const body = {
    name: 'Test Buyer',
    email: `buyer${counter}@example.com`,
    password: 'Password123',
    ...overrides,
  };
  const res = await api().post('/api/auth/register').send(body);
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { token: res.body.token, user: res.body.user, password: body.password };
}

async function createAdmin() {
  const { token, user } = await registerUser({ name: 'Store Admin' });
  // Promotion happens directly in the database, as the real create-admin script does.
  await User.updateOne({ _id: user._id }, { role: 'admin' });
  return { token, user };
}

async function seedCatalog() {
  const coc = await Category.create({ name: 'Clash of Clans', slug: 'clash-of-clans' });
  const pubg = await Category.create({ name: 'PUBG Mobile', slug: 'pubg-mobile' });
  const [th17, th14, conqueror, soldOut] = await Product.create([
    { name: 'COC TH17 Legend Account', slug: 'coc-th17', description: 'Maxed TH17 account', brand: 'Clash of Clans', price: 499, originalPrice: 649, category: coc._id, stock: 1, featured: true, soldCount: 50 },
    { name: 'COC TH14 Farming Account', slug: 'coc-th14', description: 'Great farming account', brand: 'Clash of Clans', price: 319, originalPrice: 389, category: coc._id, stock: 3, soldCount: 30 },
    { name: 'PUBG Conqueror Account', slug: 'pubg-conqueror', description: 'Mythic outfits galore', brand: 'PUBG Mobile', price: 799, originalPrice: 999, category: pubg._id, stock: 2, soldCount: 10 },
    { name: 'PUBG Sold Out Account', slug: 'pubg-sold-out', description: 'Already sold account', brand: 'PUBG Mobile', price: 529, category: pubg._id, stock: 0 },
  ]);
  return { coc, pubg, th17, th14, conqueror, soldOut };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const contact = {
  fullName: 'Test Buyer',
  email: 'buyer@example.com',
  phone: '+91 98765 43210',
  country: 'India',
  preferredContact: 'whatsapp',
};

module.exports = { startDB, stopDB, clearDB, api, registerUser, createAdmin, seedCatalog, auth, contact };
