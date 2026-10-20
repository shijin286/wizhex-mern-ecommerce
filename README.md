# WIZHEX — Game Account Marketplace (MERN)

> **Status:** frontend complete (Part 1). The Express + MongoDB backend, checkout, payments, admin dashboard and tests are in progress.

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
| Backend  | Node.js, Express, Mongoose, JWT, bcrypt *(in progress)* |
| Database | MongoDB (local or Atlas) |
| Payments | Razorpay test mode / clearly labelled simulated payments *(planned)* |

## Getting started

**Prerequisites:** Node.js 20+ and Git.

```bash
git clone https://github.com/shijin286/wizhex-mern-ecommerce.git
cd wizhex-mern-ecommerce/client
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Until the backend is added, the site runs in **Preview mode** using sample listings.

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
server/               # Express API (coming next)
```

## Disclaimer

WIZHEX is a portfolio project and does not sell real accounts. It is not affiliated with or endorsed by Supercell, KRAFTON, Konami or Activision. Game names and artwork are trademarks of their respective owners. Account transfers may be restricted by each game's terms of service.
