# WIZHEX — Game Account Marketplace (MERN)

> **Status:** frontend and core REST API complete. Checkout + payments, the admin dashboard and automated tests are in progress.

WIZHEX is a modern, responsive marketplace for buying verified game accounts for **Clash of Clans**, **PUBG Mobile**, **eFootball** and **Call of Duty**. It's built with the MERN stack as a full-stack portfolio project.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the system design and the REST API contract.

## Features (frontend)

- **Home page:** hero banner, game categories with cover art, trending accounts, best sellers, new arrivals, a deal-of-the-day countdown, promo banners and newsletter signup
- **Shop:** search, filter by game, price range and availability, five sort options, pagination, removable filter chips and a mobile filter drawer. Filters live in the URL, so searches can be shared
- **Account details:** full screenshot gallery, specifications, reviews with a rating breakdown, related accounts and delivery/guarantee info
- **Cart:** guest cart saved in `localStorage` and merged into the server cart on login. Only product IDs and quantities are sent; the server sets prices
- **Auth pages:** login and register with validation, password strength meter and redirect back to the page you came from
- **Wishlist, About, Contact and 404 pages**
- **UX polish:** loading skeletons, empty and error states, toasts, Framer Motion animations, sticky navbar, mobile menu, live search suggestions, accessible markup
- **Preview mode:** when the API is offline in development, the UI falls back to a bundled sample catalogue and shows a "Preview mode" banner

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Lucide React, Axios, React Router 6, React Hook Form, react-hot-toast |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs, express-validator, Helmet, express-rate-limit |
| Database | MongoDB (local or Atlas) |
| Payments | Razorpay test mode / clearly labelled simulated payments *(planned)* |

## Getting started

**Prerequisites:** Node.js 20+ and Git. MongoDB is optional for local development (see option A).

```bash
git clone https://github.com/shijin286/wizhex-mern-ecommerce.git
cd wizhex-mern-ecommerce
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Option A — zero setup (temporary in-memory database, auto-seeded):**

```bash
npm run dev:memory --prefix server     # API on http://localhost:5000
npm run dev --prefix client            # site on http://localhost:5173
```

**Option B — real MongoDB (local or Atlas):** set `MONGODB_URI` in `server/.env`, then:

```bash
npm run seed      # loads the 4 games, 20 listings, sample reviews and the dev admin
npm run dev       # runs API + site together
```

The development admin account comes from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `server/.env`. If the API isn't running, the site falls back to **Preview mode** with sample listings.

## API overview

| Method | Endpoint | Access |
| ------ | -------- | ------ |
| POST | `/api/auth/register`, `/api/auth/login` | public (rate limited) |
| GET | `/api/auth/me` | user |
| PUT | `/api/users/profile` · POST/PUT/DELETE `/api/users/addresses/:id` | user |
| GET | `/api/categories` · POST/PUT/DELETE `/api/categories/:id` | public · admin |
| GET | `/api/products?search&category&minPrice&maxPrice&inStock&featured&sort&page&limit` | public |
| GET | `/api/products/:id` · POST/PUT/DELETE `/api/products/:id` | public · admin |
| GET/POST | `/api/products/:id/reviews` | public / user |
| GET/PUT | `/api/cart` | user |
| GET/POST/DELETE | `/api/wishlist/:productId` | user |
| POST | `/api/newsletter`, `/api/contact` | public (rate limited) |
| GET | `/api/health` | public |

**Security:** bcrypt password hashing, JWT auth with roles always read from the database, admin-only routes, express-validator on every input, NoSQL-injection sanitising, Helmet, CORS allow-list, rate limiting, and prices that are always taken from the database, never from the client.

## Project structure

```
client/
  public/images/      # game covers and account screenshots
  src/
    components/       # Navbar, ProductCard, SearchBar, home sections, ...
    pages/            # Home, Shop, ProductDetails, Cart, Login, Register, ...
    layouts/          # MainLayout
    context/          # Auth, Cart, Wishlist providers
    hooks/            # useFetch, useDebounce, useClickOutside
    services/         # Axios API wrappers
    data/             # sample catalogue used in Preview mode
    utils/            # formatting, constants, validation
server/
  config/ models/ controllers/ routes/ middleware/ utils/ scripts/   # Express API
```

## Disclaimer

WIZHEX is a portfolio project and does not sell real accounts. It is not affiliated with or endorsed by Supercell, KRAFTON, Konami or Activision. Game names and artwork are trademarks of their respective owners. Account transfers may be restricted by each game's terms of service.
