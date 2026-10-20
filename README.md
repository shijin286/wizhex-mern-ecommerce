# WIZHEX — Game Account Marketplace (MERN)

WIZHEX is a full-stack marketplace for buying verified game accounts for **Clash of Clans**, **PUBG Mobile**, **eFootball** and **Call of Duty**. It's built with MongoDB, Express, React and Node.js as a portfolio project: real authentication, a server-verified checkout, test payments, order tracking and a role-protected admin dashboard.

> Portfolio demo: payments run in **test mode** (simulated, or Razorpay test keys). No real money is charged and no real accounts are sold.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the system design and data model.

## Features

**Storefront**
- Home page with hero banner, game categories, trending accounts, best sellers, new arrivals, a deal-of-the-day countdown and newsletter signup
- Shop with search, game filter, price range, in-stock filter, 5 sort options, pagination and shareable URL filters
- Account pages with screenshot gallery, specifications, reviews (one per buyer), related accounts and guarantee info
- Live search suggestions, wishlist, responsive layout, loading skeletons, empty/error states, toasts and Framer Motion animations

**Cart & checkout**
- Guest cart saved in `localStorage`, merged into the saved server cart on login
- 4-step checkout: delivery details → review → payment → confirmation
- **Server-side pricing:** the client only sends product IDs and quantities
- Atomic stock reservation (two buyers can't get the last account), duplicate-order protection with idempotency keys, and unpaid orders auto-released after 30 minutes
- Simulated test payment (clearly labelled) or Razorpay test checkout with HMAC signature verification

**Accounts**
- Register / login with bcrypt hashing and JWT; roles always read from the database
- Profile editing, password change, saved addresses, order history with progress timeline, pay-again and cancel

**Admin dashboard** (`/admin`, admin role only)
- Revenue, orders, handovers due, listings, sold-out and customer stats, plus a 7-day revenue chart
- Manage listings (add / edit / hide), games (categories), orders (search, filter, mark delivered, cancel with stock restore) and customers

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Lucide React, Axios, React Router 6, React Hook Form, react-hot-toast |
| Backend  | Node.js 20+, Express 4, Mongoose 8, JWT, bcryptjs, express-validator, Helmet, express-rate-limit, express-mongo-sanitize |
| Database | MongoDB (local, Atlas, or in-memory for development) |
| Testing  | Jest, Supertest, mongodb-memory-server |
| Payments | Simulated test payments, Razorpay test mode |

## Prerequisites

- Node.js **20+** and npm
- Git
- MongoDB 6+ **or** a free MongoDB Atlas cluster **or** nothing at all (use `dev:memory`)

## Installation

```bash
git clone https://github.com/shijin286/wizhex-mern-ecommerce.git
cd wizhex-mern-ecommerce
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Open `server/.env` and set at least `JWT_SECRET` (a long random string) and the `SEED_ADMIN_*` values for your local admin account. To generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Running the app

**Option A: zero setup** (temporary in-memory database, auto-seeded on every start):

```bash
npm run dev:memory
```

**Option B: real MongoDB**, either local or Atlas. Set `MONGODB_URI` in `server/.env`:

| Where | Example `MONGODB_URI` |
| ----- | -------------------- |
| Local MongoDB | `mongodb://127.0.0.1:27017/wizhex` |
| MongoDB Atlas | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/wizhex?retryWrites=true&w=majority` |

Then:

```bash
npm run seed    # loads 4 games, 20 listings, sample reviews and the dev admin
npm run dev     # API on http://localhost:5000, site on http://localhost:5173
```

Log in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `server/.env` and open http://localhost:5173/admin. `npm run create-admin` re-creates or promotes that account at any time. Both scripts refuse to run in production.

If the API is offline, the storefront falls back to **Preview mode** with the bundled sample catalogue.

## Environment variables

**server/.env**

| Variable | Purpose |
| -------- | ------- |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing secret (≥ 32 chars in production) and lifetime |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |
| `SEED_ADMIN_NAME/EMAIL/PASSWORD` | Development admin created by the seed scripts |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay **test** keys (optional) |
| `ALLOW_SIMULATED_PAYMENTS` | `true` to offer labelled test payments (set `false` on a real store) |
| `UNPAID_ORDER_TTL_MINUTES` | How long unpaid orders keep accounts reserved |

**client/.env**

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_URL` | API base URL (`/api` in development, full URL in production) |
| `VITE_DEV_PROXY_TARGET` | Where Vite proxies `/api` in development |

`.env` files are git-ignored. Only the `.env.example` templates are committed.

## API endpoints

| Method | Endpoint | Access |
| ------ | -------- | ------ |
| POST | `/api/auth/register`, `/api/auth/login` | public, rate limited |
| GET | `/api/auth/me` | user |
| PUT | `/api/users/profile` | user |
| POST / PUT / DELETE | `/api/users/addresses[/:addressId]` | user |
| GET | `/api/categories` | public |
| POST / PUT / DELETE | `/api/categories[/:id]` | admin |
| GET | `/api/products?search&category&minPrice&maxPrice&inStock&featured&sort&page&limit` | public |
| GET | `/api/products/:id` | public |
| POST / PUT / DELETE | `/api/products[/:id]` | admin (delete hides the listing) |
| GET / POST | `/api/products/:id/reviews` | public / user |
| GET / PUT | `/api/cart` | user |
| GET / POST / DELETE | `/api/wishlist[/:productId]` | user |
| GET | `/api/orders/payment-config` | public |
| POST | `/api/orders` | user: `{ items:[{product,quantity}], contact, paymentMethod, idempotencyKey }` |
| GET | `/api/orders/my-orders`, `/api/orders/:id` | owner (or admin) |
| POST | `/api/orders/:id/pay` | owner: simulated `{outcome}` or Razorpay `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` |
| POST | `/api/orders/:id/cancel` | owner |
| GET | `/api/admin/stats` | admin |
| GET | `/api/admin/orders?status&paymentStatus&search&page` | admin |
| PATCH | `/api/admin/orders/:id/status` | admin: `{ status: "delivered" \| "cancelled" }` |
| GET | `/api/admin/users?search&page` | admin |
| POST | `/api/newsletter`, `/api/contact` | public, rate limited |
| GET | `/api/health` | public |

Errors use the shape `{ success: false, message, errors? }` with the matching HTTP status (400, 401, 403, 404, 409, 422, 429, 500).

## Security

- Passwords hashed with bcrypt (12 rounds) and never returned by the API
- JWT carries only the user id; the role is loaded from the database on every request, so editing the token or frontend state can't grant admin rights
- A `role` sent at registration is ignored
- express-validator on every input, NoSQL operator stripping, escaped search regexes
- Helmet, CORS allow-list, JSON body size limit, rate limits on login/register and public forms
- Prices, totals and stock are computed on the server; Razorpay payments are verified with HMAC-SHA256
- No card data is collected or stored

## Testing

```bash
npm test
```

26 Jest + Supertest tests run against an in-memory MongoDB. They cover registration and login, admin-role injection, NoSQL injection, product filters, sorting and pagination, regex-safe search, admin-only listing management, reviews, cart clamping, server-side pricing with tampered prices, stock reservation and rollback, idempotent orders, payment success, failure and retry, order privacy, cancellation with stock restore, and admin stats and status transitions.

## Deployment

1. **Database:** create a free MongoDB Atlas cluster and copy its connection string.
2. **API (Render / Railway):** deploy the `server` folder with build command `npm install` and start command `npm start`. Set `NODE_ENV=production`, `MONGODB_URI`, a strong `JWT_SECRET`, `CLIENT_URL=https://<your-frontend-domain>`, and the payment variables. Run `npm run seed -- --force` once from a shell if you want the sample catalogue.
3. **Frontend (Vercel / Netlify):** deploy the `client` folder with build command `npm run build` and output directory `dist`. Set `VITE_API_URL=https://<your-api-domain>/api`. SPA routing is preconfigured (`vercel.json`, `public/_redirects`).
4. Create your admin account with `npm run create-admin -- --force` (from a secure shell, with `SEED_ADMIN_*` set), then remove those variables.

## Project structure

```
client/                 React + Vite storefront and admin dashboard
  public/images/        game covers and account screenshots
  src/components/       UI building blocks (Navbar, ProductCard, Modal, ...)
  src/pages/            store pages; src/pages/admin/ for the dashboard
  src/layouts/          MainLayout, AdminLayout
  src/context/          Auth, Cart, Wishlist providers
  src/hooks/            useAuth, useCart, useWishlist, usePayment, useFetch, ...
  src/services/         Axios API wrappers
  src/data/             sample catalogue (Preview mode + seed source)
server/                 Express REST API
  config/ models/ controllers/ routes/ middleware/ utils/ scripts/ tests/
```

## Disclaimer

WIZHEX is a portfolio project and does not sell real accounts. It is not affiliated with or endorsed by Supercell, KRAFTON, Konami or Activision. Game names and artwork are trademarks of their respective owners, and account transfers may be restricted by each game's terms of service.
