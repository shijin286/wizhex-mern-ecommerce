const Product = require('../models/Product');
const Order = require('../models/Order');
const { startDB, stopDB, clearDB, api, registerUser, createAdmin, seedCatalog, auth, contact } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
let catalog;
let buyer;
beforeEach(async () => {
  await clearDB();
  catalog = await seedCatalog();
  buyer = await registerUser();
});

const placeOrder = (token, overrides = {}) =>
  api()
    .post('/api/orders')
    .set(auth(token))
    .send({
      items: [{ product: catalog.th14._id, quantity: 2 }],
      contact,
      paymentMethod: 'simulated',
      idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
      ...overrides,
    });

describe('Orders', () => {
  test('calculates prices on the server and ignores prices sent by the client', async () => {
    const res = await placeOrder(buyer.token, {
      items: [{ product: catalog.th14._id, quantity: 2, price: 1 }],
      subtotal: 1,
      totalAmount: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.order.items[0].price).toBe(319);
    expect(res.body.order).toMatchObject({ subtotal: 638, deliveryFee: 0, totalAmount: 638, paymentStatus: 'pending' });
    expect(res.body.payment).toMatchObject({ provider: 'simulated', isTest: true });
  });

  test('reserves stock and rejects orders larger than the available stock', async () => {
    await placeOrder(buyer.token, { items: [{ product: catalog.th17._id, quantity: 1 }] });
    expect((await Product.findById(catalog.th17._id)).stock).toBe(0);

    const other = await registerUser();
    const second = await placeOrder(other.token, { items: [{ product: catalog.th17._id, quantity: 1 }] });
    expect(second.status).toBe(409);
  });

  test('does not leave stock reserved when part of an order fails', async () => {
    const res = await placeOrder(buyer.token, {
      items: [
        { product: catalog.th14._id, quantity: 1 },
        { product: catalog.soldOut._id, quantity: 1 },
      ],
    });
    expect(res.status).toBe(409);
    expect((await Product.findById(catalog.th14._id)).stock).toBe(3);
  });

  test('is idempotent: retrying with the same key returns the same order', async () => {
    const key = 'retry-key-123456';
    const first = await placeOrder(buyer.token, { idempotencyKey: key });
    const retry = await placeOrder(buyer.token, { idempotencyKey: key });

    expect(first.status).toBe(201);
    expect(retry.status).toBe(200);
    expect(retry.body.order._id).toBe(first.body.order._id);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Product.findById(catalog.th14._id)).stock).toBe(1);
  });

  test('validates contact details on the server', async () => {
    const res = await placeOrder(buyer.token, { contact: { ...contact, email: 'not-an-email', phone: 'abc' } });
    expect(res.status).toBe(422);
  });

  test('simulated payment: failure can be retried, success marks the order paid once', async () => {
    const { body } = await placeOrder(buyer.token);
    const payUrl = `/api/orders/${body.order._id}/pay`;

    const failed = await api().post(payUrl).set(auth(buyer.token)).send({ outcome: 'failure' });
    expect(failed.status).toBe(402);
    expect(failed.body.order.paymentStatus).toBe('failed');

    const paid = await api().post(payUrl).set(auth(buyer.token)).send({ outcome: 'success' });
    expect(paid.body.order).toMatchObject({ paymentStatus: 'paid', orderStatus: 'processing' });

    const again = await api().post(payUrl).set(auth(buyer.token)).send({ outcome: 'success' });
    expect(again.status).toBe(200);
    expect((await Product.findById(catalog.th14._id)).soldCount).toBe(32); // 30 + 2, counted once
  });

  test('rejects Razorpay confirmations when Razorpay is not configured', async () => {
    const res = await placeOrder(buyer.token, { paymentMethod: 'razorpay' });
    expect(res.status).toBe(400);
  });

  test("users can only see and pay for their own orders", async () => {
    const { body } = await placeOrder(buyer.token);
    const stranger = await registerUser();

    expect((await api().get(`/api/orders/${body.order._id}`).set(auth(stranger.token))).status).toBe(404);
    expect((await api().post(`/api/orders/${body.order._id}/pay`).set(auth(stranger.token)).send({})).status).toBe(404);

    const mine = await api().get('/api/orders/my-orders').set(auth(stranger.token));
    expect(mine.body.orders).toHaveLength(0);
  });

  test('cancelling an order restores stock', async () => {
    const { body } = await placeOrder(buyer.token);
    const res = await api().post(`/api/orders/${body.order._id}/cancel`).set(auth(buyer.token));
    expect(res.body.order.orderStatus).toBe('cancelled');
    expect((await Product.findById(catalog.th14._id)).stock).toBe(3);

    const again = await api().post(`/api/orders/${body.order._id}/cancel`).set(auth(buyer.token));
    expect(again.status).toBe(409);
  });
});

describe('Admin', () => {
  test('admin routes are blocked for regular users', async () => {
    expect((await api().get('/api/admin/stats').set(auth(buyer.token))).status).toBe(403);
    expect((await api().get('/api/admin/users')).status).toBe(401);
  });

  test('admin sees stats and moves a paid order to delivered', async () => {
    const admin = await createAdmin();
    const { body } = await placeOrder(buyer.token);
    await api().post(`/api/orders/${body.order._id}/pay`).set(auth(buyer.token)).send({ outcome: 'success' });

    const stats = await api().get('/api/admin/stats').set(auth(admin.token));
    expect(stats.body.stats).toMatchObject({ orders: 1, revenue: 638, toDeliver: 1 });
    // Today's sale must appear in the last day of the 7-day chart.
    expect(stats.body.salesByDay).toHaveLength(7);
    expect(stats.body.salesByDay[6]).toMatchObject({ revenue: 638, orders: 1 });

    const delivered = await api()
      .patch(`/api/admin/orders/${body.order._id}/status`)
      .set(auth(admin.token))
      .send({ status: 'delivered' });
    expect(delivered.body.order.orderStatus).toBe('delivered');

    const invalid = await api()
      .patch(`/api/admin/orders/${body.order._id}/status`)
      .set(auth(admin.token))
      .send({ status: 'cancelled' });
    expect(invalid.status).toBe(400);
  });

  test('admin can search orders and list users', async () => {
    const admin = await createAdmin();
    await placeOrder(buyer.token);

    const orders = await api().get('/api/admin/orders?search=buyer@example.com').set(auth(admin.token));
    expect(orders.body.total).toBe(1);

    const users = await api().get('/api/admin/users').set(auth(admin.token));
    expect(users.body.users.find((u) => u.email === buyer.user.email).orderCount).toBe(1);
    expect(users.body.users[0].passwordHash).toBeUndefined();
  });
});
