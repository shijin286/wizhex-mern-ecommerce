# WIZHEX — Architecture & API Contract

This document is the single source of truth that keeps the client and server consistent across all build parts.

## 1. High-level architecture

```
┌──────────────────────────── Browser ────────────────────────────┐
│ React 18 + Vite + Tailwind + Framer Motion                      │
│  pages/ ─ layouts/ ─ components/                                │
│  context/ (Auth, Cart, Wishlist)  ──►  services/ (Axios)        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS  /api/*  (JWT Bearer)
┌───────────────────────────────▼─────────────────────────────────┐
│ Node.js + Express                                               │
│  routes/ ─► middleware/ (auth, admin, validate, rateLimit)      │
│          ─► controllers/ ─► models/ (Mongoose)                  │
│  utils/ (pricing, ApiError, asyncHandler)                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Mongoose
                        ┌───────▼────────┐
                        │   MongoDB      │
                        └────────────────┘
```

Key principles

- **Server is authoritative** for prices, stock, shipping, totals, roles and payment status. The client only sends product IDs and quantities.
- **JWT** in an `Authorization: Bearer` header. Token stored in `localStorage` (trade-off documented in README). Role is read from the database on every request, never from the token payload alone or from client state.
- **Guest cart** lives in `localStorage`; on login it is merged into the server cart.
- **Idempotent orders**: the client sends an `idempotencyKey` (UUID) per checkout attempt; the server rejects duplicates.

## 2. Folder structure

```
wizhex-mern-ecommerce/
├── package.json              # root scripts (concurrently)
├── README.md
├── ARCHITECTURE.md
├── .gitignore
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── public/favicon.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/       # reusable UI (Navbar, ProductCard, ...)
│       │   └── home/         # home-page sections
│       ├── pages/            # route-level pages
│       │   └── admin/        # admin dashboard pages (Part 6)
│       ├── layouts/          # MainLayout, AdminLayout (Part 6)
│       ├── hooks/            # useFetch, useDebounce, useClickOutside
│       ├── context/          # AuthContext, CartContext, WishlistContext
│       ├── services/         # Axios API wrappers
│       └── utils/            # formatting, constants, helpers
└── server/
    ├── server.js
    ├── app.js
    ├── package.json
    ├── .env.example
    ├── config/               # db.js, env.js
    ├── models/               # User, Product, Category, Order, Review, Cart, Wishlist, ...
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── utils/
    ├── scripts/              # seed.js, createAdmin.js
    └── tests/                # Jest + Supertest + mongodb-memory-server
```

## 3. Shared business constants

| Constant                  | Value  | Where                                              |
| ------------------------- | ------ | -------------------------------------------------- |
| Currency                  | USD $  | client `utils/format.js`, server                   |
| `FREE_SHIPPING_THRESHOLD` | 0 (digital delivery) | client `utils/constants.js`, server `utils/pricing.js` |
| `SHIPPING_FEE`            | 0      | same                                               |
| Max quantity per line     | stock  | enforced server-side                               |

## 4. Data shapes returned by the API

```js
// Product (category populated)
{
  _id, name, slug, description, brand,
  price, originalPrice, discountPercent,      // discountPercent is a virtual
  category: { _id, name, slug },
  images: [String], stock, rating, reviewCount, soldCount,
  featured, specifications: [{ label, value }], createdAt
}

// User (never includes passwordHash)
{ _id, name, email, role: 'user' | 'admin', addresses: [Address], createdAt }

// Address
{ _id, fullName, phone, line1, line2, city, state, postalCode, country, isDefault }

// Cart item (server response)
{ product: Product, quantity }
```

## 5. REST API contract

All responses are JSON. Errors: `{ success: false, message, errors? }` with a proper HTTP status.

### Auth
| Method | Path                 | Auth | Body / Query                 | Response              |
| ------ | -------------------- | ---- | ---------------------------- | --------------------- |
| POST   | `/api/auth/register` | –    | `{ name, email, password }`  | `201 { token, user }` |
| POST   | `/api/auth/login`    | –    | `{ email, password }`        | `{ token, user }`     |
| GET    | `/api/auth/me`       | user | –                            | `{ user }`            |

### Users (self-service)
| Method | Path                                  | Auth | Notes                              |
| ------ | ------------------------------------- | ---- | ---------------------------------- |
| PUT    | `/api/users/profile`                  | user | `{ name, email, currentPassword?, newPassword? }` → `{ user }` |
| POST   | `/api/users/addresses`                | user | Address → `{ addresses }`          |
| PUT    | `/api/users/addresses/:addressId`     | user | Address → `{ addresses }`          |
| DELETE | `/api/users/addresses/:addressId`     | user | → `{ addresses }`                  |

### Categories
| Method | Path                    | Auth  | Response                                            |
| ------ | ----------------------- | ----- | --------------------------------------------------- |
| GET    | `/api/categories`       | –     | `{ categories: [{ _id, name, slug, description, image, productCount }] }` |
| POST   | `/api/categories`       | admin | `201 { category }`                                  |
| PUT    | `/api/categories/:id`   | admin | `{ category }`                                      |
| DELETE | `/api/categories/:id`   | admin | `{ message }` (409 if products still use it)        |

### Products
| Method | Path                         | Auth  | Notes |
| ------ | ---------------------------- | ----- | ----- |
| GET    | `/api/products`              | –     | Query: `search, category (slug), minPrice, maxPrice, sort (newest\|popular\|price_asc\|price_desc\|rating), featured=true, inStock=true, page, limit (max 50)` → `{ products, page, pages, total }` |
| GET    | `/api/products/:id`          | –     | `{ product }` |
| POST   | `/api/products`              | admin | `201 { product }` |
| PUT    | `/api/products/:id`          | admin | `{ product }` |
| DELETE | `/api/products/:id`          | admin | `{ message }` |
| GET    | `/api/products/:id/reviews`  | –     | `{ reviews: [{ _id, user: { _id, name }, rating, comment, createdAt }] }` |
| POST   | `/api/products/:id/reviews`  | user  | `{ rating 1-5, comment }` → `201 { review }` (one per user per product) |

### Cart (logged-in users)
| Method | Path        | Auth | Notes |
| ------ | ----------- | ---- | ----- |
| GET    | `/api/cart` | user | `{ items: [{ product, quantity }] }` |
| PUT    | `/api/cart` | user | `{ items: [{ product: id, quantity }] }` → replaces cart, quantities clamped to stock, unknown/inactive products dropped → `{ items }` |

### Wishlist (logged-in users)
| Method | Path                       | Auth | Response          |
| ------ | -------------------------- | ---- | ----------------- |
| GET    | `/api/wishlist`            | user | `{ products }`    |
| POST   | `/api/wishlist/:productId` | user | `{ products }`    |
| DELETE | `/api/wishlist/:productId` | user | `{ products }`    |

### Orders
| Method | Path                         | Auth  | Notes |
| ------ | ---------------------------- | ----- | ----- |
| POST   | `/api/orders`                | user  | `{ items: [{ product, quantity }], shippingAddress, paymentMethod: 'cod'\|'razorpay'\|'simulated', idempotencyKey }` → `201 { order, payment? }`. Server recomputes prices, validates and reserves stock atomically. |
| GET    | `/api/orders/my-orders`      | user  | `{ orders }` |
| GET    | `/api/orders/:id`            | owner/admin | `{ order }` |
| POST   | `/api/orders/:id/pay`        | owner | Confirms payment. Razorpay: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` verified with HMAC. Simulated: `{ simulated: true, outcome: 'success'\|'failure' }` (disabled in production). Idempotent. |
| POST   | `/api/orders/:id/cancel`     | owner | Only while `pending`/`processing`; restores stock. |

### Admin
| Method | Path                              | Auth  | Notes |
| ------ | --------------------------------- | ----- | ----- |
| GET    | `/api/admin/stats`                | admin | `{ stats: { products, orders, users, revenue, pendingOrders, lowStock }, recentOrders, salesByDay }` |
| GET    | `/api/admin/orders`               | admin | Query: `status, search, page, limit` → `{ orders, page, pages, total }` |
| PATCH  | `/api/admin/orders/:id/status`    | admin | `{ status: pending\|processing\|shipped\|delivered\|cancelled }` (validated transitions) |
| GET    | `/api/admin/users`                | admin | Query: `search, page` → `{ users, page, pages, total }` |

### Misc
| Method | Path              | Auth | Notes |
| ------ | ----------------- | ---- | ----- |
| POST   | `/api/newsletter` | –    | `{ email }` → `{ message }` (rate limited) |
| POST   | `/api/contact`    | –    | `{ name, email, subject, message }` → `201 { message }` (rate limited) |
| GET    | `/api/health`     | –    | `{ status: 'ok' }` |

## 6. Client routes

| Path                      | Page              | Access      | Part |
| ------------------------- | ----------------- | ----------- | ---- |
| `/`                       | Home              | public      | 1 |
| `/shop`                   | Shop              | public      | 1 |
| `/categories`             | Categories        | public      | 1 |
| `/product/:id`            | ProductDetails    | public      | 1 |
| `/cart`                   | Cart              | public      | 1 |
| `/login`, `/register`     | Auth              | guests      | 1 |
| `/about`, `/contact`      | Static + form     | public      | 1 |
| `/wishlist`               | Wishlist          | user        | 1 |
| `/checkout`               | Checkout (4 steps)| user        | 5 |
| `/order-success/:id`      | OrderSuccess      | user        | 5 |
| `/profile`                | Profile/Addresses | user        | 5 |
| `/orders`, `/orders/:id`  | Order history     | user        | 5 |
| `/admin/*`                | Admin dashboard   | admin       | 6 |
