// Game accounts are delivered digitally, so there is no delivery charge.
// The server recalculates every price and fee at order time and never trusts
// values sent by the client.
export const FREE_SHIPPING_THRESHOLD = 0;
export const SHIPPING_FEE = 0;
export const DELIVERY_PROMISE = 'Login details delivered within 24 hours';

export const PRODUCTS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const SUPPORT = {
  email: 'support@wizhex.example',
  phone: '+91 80000 00000',
  hours: 'Mon–Sat, 9:00 AM – 8:00 PM IST',
  address: 'WIZHEX HQ, Shornur 2, Palakkad, Kerala, India',
};

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Cpath d='M150 250l40-50 30 36 20-24 40 38H150z' fill='%23cbd5e1'/%3E%3Ccircle cx='245' cy='165' r='16' fill='%23cbd5e1'/%3E%3C/svg%3E";
