const { startDB, stopDB, clearDB, api, registerUser, auth } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);
afterEach(clearDB);

describe('Auth', () => {
  test('registers a user, hashes the password and never returns it', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'Asha@Example.com', password: 'Password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('asha@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('ignores a "role" field so nobody can sign up as admin', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'sneaky@example.com', password: 'Password123', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });

  test('rejects weak passwords and duplicate emails', async () => {
    const weak = await api().post('/api/auth/register').send({ name: 'Weak', email: 'w@example.com', password: 'short' });
    expect(weak.status).toBe(422);
    expect(weak.body.errors.password).toBeDefined();

    await registerUser({ email: 'dup@example.com' });
    const dup = await api().post('/api/auth/register').send({ name: 'Dup', email: 'dup@example.com', password: 'Password123' });
    expect(dup.status).toBe(409);
  });

  test('logs in with correct credentials only', async () => {
    await registerUser({ email: 'login@example.com', password: 'Password123' });

    const ok = await api().post('/api/auth/login').send({ email: 'login@example.com', password: 'Password123' });
    expect(ok.status).toBe(200);

    const bad = await api().post('/api/auth/login').send({ email: 'login@example.com', password: 'WrongPass1' });
    expect(bad.status).toBe(401);
    expect(bad.body.message).toBe('Invalid email or password');
  });

  test('blocks NoSQL operator injection in login', async () => {
    const res = await api().post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(422);
  });

  test('GET /me requires a valid token', async () => {
    const { token } = await registerUser();
    expect((await api().get('/api/auth/me').set(auth(token))).status).toBe(200);
    expect((await api().get('/api/auth/me')).status).toBe(401);
    expect((await api().get('/api/auth/me').set(auth('not-a-real-token'))).status).toBe(401);
  });
});
