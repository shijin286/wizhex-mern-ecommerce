const { startDB, stopDB, clearDB, api, registerUser, createAdmin, seedCatalog, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
let catalog;
beforeEach(async () => {
  await clearDB();
  catalog = await seedCatalog();
});

describe('Products', () => {
  test('lists products with pagination metadata', async () => {
    const res = await api().get('/api/products?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body).toMatchObject({ page: 1, pages: 2, total: 4 });
  });

  test('filters by game, price range, search and stock', async () => {
    const byGame = await api().get('/api/products?category=clash-of-clans');
    expect(byGame.body.total).toBe(2);

    const byPrice = await api().get('/api/products?minPrice=400&maxPrice=600');
    expect(byPrice.body.products.map((p) => p.price).sort()).toEqual([499, 529]);

    const bySearch = await api().get('/api/products?search=conqueror');
    expect(bySearch.body.products).toHaveLength(1);

    const inStock = await api().get('/api/products?inStock=true');
    expect(inStock.body.total).toBe(3);
  });

  test('sorts by price and popularity', async () => {
    const asc = await api().get('/api/products?sort=price_asc');
    const prices = asc.body.products.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const popular = await api().get('/api/products?sort=popular');
    expect(popular.body.products[0].name).toBe('COC TH17 Legend Account');
  });

  test('treats regex characters in search as plain text', async () => {
    const res = await api().get('/api/products?search=.*');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  test('returns 404 for unknown or malformed ids', async () => {
    expect((await api().get('/api/products/notanid')).status).toBe(404);
    expect((await api().get('/api/products/507f1f77bcf86cd799439011')).status).toBe(404);
    const ok = await api().get(`/api/products/${catalog.th17._id}`);
    expect(ok.body.product.discountPercent).toBe(23);
  });

  test('only admins can create, update and delete listings', async () => {
    const { token: userToken } = await registerUser();
    const { token: adminToken } = await createAdmin();
    const listing = { name: 'COC TH12 Account', description: 'Solid TH12 account', category: 'clash-of-clans', price: 300, stock: 1 };

    expect((await api().post('/api/products').send(listing)).status).toBe(401);
    expect((await api().post('/api/products').set(auth(userToken)).send(listing)).status).toBe(403);

    const created = await api().post('/api/products').set(auth(adminToken)).send(listing);
    expect(created.status).toBe(201);
    expect(created.body.product.category.slug).toBe('clash-of-clans');

    const updated = await api().put(`/api/products/${created.body.product._id}`).set(auth(adminToken)).send({ price: 350 });
    expect(updated.body.product.price).toBe(350);

    const deleted = await api().delete(`/api/products/${created.body.product._id}`).set(auth(adminToken));
    expect(deleted.status).toBe(200);
    expect((await api().get(`/api/products/${created.body.product._id}`)).status).toBe(404);
  });

  test('allows one review per user and updates the rating', async () => {
    const { token } = await registerUser();
    const url = `/api/products/${catalog.th14._id}/reviews`;

    const first = await api().post(url).set(auth(token)).send({ rating: 4, comment: 'Smooth transfer, great account!' });
    expect(first.status).toBe(201);

    const second = await api().post(url).set(auth(token)).send({ rating: 5, comment: 'Trying to review twice here' });
    expect(second.status).toBe(409);

    const product = await api().get(`/api/products/${catalog.th14._id}`);
    expect(product.body.product).toMatchObject({ rating: 4, reviewCount: 1 });
  });
});

describe('Cart', () => {
  test('merges duplicates, clamps to stock and drops sold-out listings', async () => {
    const { token } = await registerUser();
    const res = await api()
      .put('/api/cart')
      .set(auth(token))
      .send({
        items: [
          { product: catalog.th14._id, quantity: 2 },
          { product: catalog.th14._id, quantity: 5 },
          { product: catalog.soldOut._id, quantity: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(3);

    const saved = await api().get('/api/cart').set(auth(token));
    expect(saved.body.items[0].product.price).toBe(319);
  });
});
