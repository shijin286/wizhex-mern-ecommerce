// Sample catalogue used ONLY when the API is unreachable (development preview).
// Once the backend runs, all data comes from MongoDB. The seed script (Part 7)
// inserts the same listings, so the preview matches the real store.

const img = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  mobileGames: 'photo-1627856013091-fed6e4e30025',
  dragon: 'photo-1601987077677-5346c0c57d3f',
  retroPink: 'photo-1550745165-9bc0b252726f',
  neonPad: 'photo-1612287230202-1ff1d85d1bdf',
  esports: 'photo-1542751371-adc38448a05e',
  openWorldLaptop: 'photo-1640955014216-75201056c829',
  shooterMonitor: 'photo-1534423861386-85a16f5d13fd',
  headsetGamer: 'photo-1560253023-3ec5d502959f',
  warzoneSetup: 'photo-1593305841991-05c297ba4575',
  shooterTv: 'photo-1600861194942-f883de0dfe96',
  darkSetup: 'photo-1603481546238-487240415921',
  redPad: 'photo-1585620385456-4759f9b5c7d9',
  footballGame: 'photo-1493711662062-fa541adb3fc8',
  trophy: 'photo-1518091043644-c1d4457512c6',
  stadiumNight: 'photo-1431324155629-1a6deb1dec8d',
  ballOnGrass: 'photo-1574629810360-7efbbe195018',
  ballCloseUp: 'photo-1579952363873-27f3bade9f55',
  streetKick: 'photo-1606925797300-0b35e9d1794e',
  gamingRoom: 'photo-1616588589676-62b3bd4ff6d2',
  multiMonitor: 'photo-1598550476439-6847785fcea6',
};

export const photo = (key, w) => img(PHOTOS[key], w);

export const DEMO_CATEGORIES = [
  {
    _id: 'cat-coc',
    name: 'Clash of Clans',
    slug: 'clash-of-clans',
    description: 'Maxed and war-ready Town Hall accounts with strong heroes and gems.',
    image: '/images/coc/coc-cover.png',
  },
  {
    _id: 'cat-pubg',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    description: 'High-tier accounts with Mythic outfits, upgraded guns and rare skins.',
    image: '/images/pubg/pubg-mythic-supercar.png',
  },
  {
    _id: 'cat-efootball',
    name: 'eFootball',
    slug: 'efootball',
    description: 'Epic squads with high team strength, ready for Division 1 pushes.',
    image: '/images/efootball/efootball-cover.png',
  },
  {
    _id: 'cat-cod',
    name: 'Call of Duty',
    slug: 'call-of-duty',
    description: 'Call of Duty: Mobile and Warzone accounts with Mythic weapons, rare operators and ranked rewards.',
    image: '/images/cod/cod-cover.png',
  },
];

const cat = (slug) => {
  const { _id, name } = DEMO_CATEGORIES.find((c) => c.slug === slug);
  return { _id, name, slug };
};

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

const RAW_PRODUCTS = [
  // Clash of Clans (photos are real in-game screenshots in /public/images/coc)
  {
    name: "COC Town Hall 17 Legend Account — XP 234",
    brand: 'Clash of Clans',
    category: 'clash-of-clans',
    price: 499,
    originalPrice: 649,
    images: ["/images/coc/coc-th17-legend.webp"],
    stock: 1,
    rating: 4.9,
    reviewCount: 41,
    soldCount: 52,
    featured: true,
    age: 0,
    description:
      "End-game account at experience level 234 with 7,370 gems, nearly 20M gold and 16M elixir in storage, plus a premium scenery. Clean history, never banned. Transferred to your own Supercell ID with full email access.",
    specifications: [
      ["Town Hall", "TH17"],
      ["Experience level", "234"],
      ["Gems", "7,370"],
      ["Resources", "19.9M gold · 16.3M elixir"],
      ["Login", "Supercell ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "COC Town Hall 16 Max Defence Account",
    brand: 'Clash of Clans',
    category: 'clash-of-clans',
    price: 469,
    originalPrice: 579,
    images: ["/images/coc/coc-th16-max.png"],
    stock: 1,
    rating: 4.8,
    reviewCount: 33,
    soldCount: 45,
    featured: true,
    age: 2,
    description:
      "Maxed Town Hall 16 with fully upgraded defences, walls and traps. Strong for Legend League pushes and clan war leagues.",
    specifications: [
      ["Town Hall", "TH16 (max defences)"],
      ["Walls", "Maxed"],
      ["Login", "Supercell ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "COC Town Hall 16 Scenery Collector Account",
    brand: 'Clash of Clans',
    category: 'clash-of-clans',
    price: 429,
    originalPrice: 529,
    images: ["/images/coc/coc-th16-scenery.png"],
    stock: 1,
    rating: 4.7,
    reviewCount: 22,
    soldCount: 28,
    featured: false,
    age: 5,
    description:
      "High-level Town Hall 16 with an exclusive event scenery, hero skins and a well-built anti-3-star war layout.",
    specifications: [
      ["Town Hall", "TH16"],
      ["Extras", "Event scenery + hero skins"],
      ["Login", "Supercell ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "COC Town Hall 15 War Base Account",
    brand: 'Clash of Clans',
    category: 'clash-of-clans',
    price: 379,
    originalPrice: 469,
    images: ["/images/coc/coc-th15-war.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 18,
    soldCount: 24,
    featured: false,
    age: 9,
    description:
      "War-ready Town Hall 15 on a dark-themed scenery, with strong defences and an efficient war base layout.",
    specifications: [
      ["Town Hall", "TH15"],
      ["Scenery", "Dark theme"],
      ["Login", "Supercell ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "COC Town Hall 14 Farming Account — 1,245 Gems",
    brand: 'Clash of Clans',
    category: 'clash-of-clans',
    price: 319,
    originalPrice: 389,
    images: ["/images/coc/coc-th14-farming.png"],
    stock: 1,
    rating: 4.5,
    reviewCount: 15,
    soldCount: 31,
    featured: false,
    age: 14,
    description:
      "Great-value farming account with 1,245 gems and 8.6M gold, 3.8M elixir and 381K dark elixir ready to spend on upgrades.",
    specifications: [
      ["Town Hall", "TH14"],
      ["Gems", "1,245"],
      ["Resources", "8.6M gold · 3.8M elixir · 381K dark elixir"],
      ["Login", "Supercell ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },

  // PUBG Mobile (photos are real in-game screenshots in /public/images/pubg)
  {
    name: "PUBG Mobile X-Suit Collection Account",
    brand: 'PUBG Mobile',
    category: 'pubg-mobile',
    price: 799,
    originalPrice: 999,
    images: ["/images/pubg/pubg-x-suit-collection.png"],
    stock: 1,
    rating: 4.9,
    reviewCount: 21,
    soldCount: 17,
    featured: true,
    age: 0,
    description:
      "Collector-grade account with multiple upgraded X-Suits, a full set of premium outfits, an upgraded gun skin, a classic car skin and a companion pet.",
    specifications: [
      ["Highlight", "Multiple X-Suits"],
      ["Extras", "Upgraded gun skin · classic car skin · companion"],
      ["Login", "Email transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "PUBG Mobile Arctic Conqueror Set Account",
    brand: 'PUBG Mobile',
    category: 'pubg-mobile',
    price: 729,
    originalPrice: 899,
    images: ["/images/pubg/pubg-arctic-conqueror.png"],
    stock: 1,
    rating: 4.8,
    reviewCount: 18,
    soldCount: 22,
    featured: true,
    age: 2,
    description:
      "Includes the Arctic Conqueror set, a lion companion, an upgraded pink gun skin and a vintage off-road vehicle skin, plus a large outfit collection.",
    specifications: [
      ["Highlight", "Arctic Conqueror set"],
      ["Companion", "Lion"],
      ["Extras", "Upgraded gun skin · vehicle skin"],
      ["Login", "Email transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "PUBG Mobile Mythic Outfit + Supercar Account",
    brand: 'PUBG Mobile',
    category: 'pubg-mobile',
    price: 649,
    originalPrice: 799,
    images: ["/images/pubg/pubg-mythic-supercar.png"],
    stock: 1,
    rating: 4.7,
    reviewCount: 15,
    soldCount: 19,
    featured: false,
    age: 4,
    description:
      "Mythic outfit with a matching upgraded weapon skin, a yellow supercar skin and a companion. Comes with UC left in the wallet.",
    specifications: [
      ["Highlight", "Mythic outfit + upgraded weapon"],
      ["Vehicle", "Supercar skin"],
      ["Login", "Email transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "PUBG Mobile Pink Supercar Lobby Account",
    brand: 'PUBG Mobile',
    category: 'pubg-mobile',
    price: 579,
    originalPrice: 699,
    images: ["/images/pubg/pubg-supercar-lobby.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 12,
    soldCount: 14,
    featured: false,
    age: 7,
    description:
      "Stylish account with a pink supercar skin, a premium female outfit and a themed lobby.",
    specifications: [
      ["Vehicle", "Pink supercar skin"],
      ["Outfit", "Premium set"],
      ["Login", "Email transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "PUBG Mobile 5-Year Veteran Account — Level 69",
    brand: 'PUBG Mobile',
    category: 'pubg-mobile',
    price: 529,
    originalPrice: 649,
    images: ["/images/pubg/pubg-5-years-veteran.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 10,
    soldCount: 12,
    featured: false,
    age: 11,
    description:
      "Five-year-old account at player level 69 with 6,160 matches played, 4,690 achievement points, a 2,754 season rating and 100 merit.",
    specifications: [
      ["Player level", "69"],
      ["Account age", "5 years"],
      ["Matches played", "6,160"],
      ["Achievement points", "4,690"],
      ["Merit", "100"],
      ["Login", "Email transfer"],
    ],
  },

  // eFootball (photos are real in-game screenshots in /public/images/efootball)
  {
    name: "eFootball 3341 Strength Account — Long Ball Counter",
    brand: 'eFootball',
    category: 'efootball',
    price: 499,
    originalPrice: 629,
    images: ["/images/efootball/efootball-3341-strength.png"],
    stock: 1,
    rating: 4.9,
    reviewCount: 27,
    soldCount: 31,
    featured: true,
    age: 0,
    description:
      "Top-tier squad with a 3341 collective strength, set up in a 3-1-2 Long Ball Counter shape. Every starter is rated 106–109, including a 109 CF and a 109 LB.",
    specifications: [
      ["Collective strength", "3341"],
      ["Formation", "3-1-2 · Long Ball Counter"],
      ["Starting XI ratings", "106–109"],
      ["Login", "KONAMI ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "eFootball Global No. 1 Possession Squad",
    brand: 'eFootball',
    category: 'efootball',
    price: 479,
    originalPrice: 599,
    images: ["/images/efootball/efootball-global-no1.png"],
    stock: 1,
    rating: 4.9,
    reviewCount: 19,
    soldCount: 22,
    featured: true,
    age: 1,
    description:
      "The 4-2-1-3 Possession Game squad that reached Global No. 1. Includes a 111-rated SS, twin 109 CFs and 108+ rated defenders.",
    specifications: [
      ["Achievement", "Reached Global No. 1"],
      ["Formation", "4-2-1-3 · Possession Game"],
      ["Top rating", "111 (SS)"],
      ["Login", "KONAMI ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "eFootball Epic Fusion Squad — 110 Rated Attack",
    brand: 'eFootball',
    category: 'efootball',
    price: 449,
    originalPrice: 549,
    images: ["/images/efootball/efootball-fusion-squad.png"],
    stock: 1,
    rating: 4.8,
    reviewCount: 16,
    soldCount: 20,
    featured: false,
    age: 3,
    description:
      "Attack-minded Epic squad with a 110 CF, 110 RWF, 109 CF and 107 LWF, backed by a 108 CB and a 107 GK.",
    specifications: [
      ["Attack ratings", "107–110"],
      ["Defence ratings", "105–108"],
      ["Goalkeeper", "107"],
      ["Login", "KONAMI ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "eFootball Legends Squad Account",
    brand: 'eFootball',
    category: 'efootball',
    price: 399,
    originalPrice: 489,
    images: ["/images/efootball/efootball-legends-squad.png"],
    stock: 1,
    rating: 4.7,
    reviewCount: 14,
    soldCount: 18,
    featured: false,
    age: 6,
    description:
      "Full squad of Epic legend cards with 106 and 104 CFs, a 105 AMF, 105 wingers and a 103 GK. Great for classic attacking football.",
    specifications: [
      ["Card type", "Epic legends"],
      ["Attack ratings", "104–106"],
      ["Goalkeeper", "103"],
      ["Login", "KONAMI ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "eFootball Portugal National Team Squad",
    brand: 'eFootball',
    category: 'efootball',
    price: 329,
    originalPrice: 399,
    images: ["/images/efootball/efootball-portugal-squad.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 11,
    soldCount: 15,
    featured: false,
    age: 10,
    description:
      "All-Portugal squad playing quick counter-attacks, led by a 107 CF with a 104 LMF, 104 CMF and 107 CB.",
    specifications: [
      ["Theme", "Portugal national team"],
      ["Playstyle", "Quick counter"],
      ["Top rating", "107 (CF, CB)"],
      ["Login", "KONAMI ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },

  // Call of Duty (photos are real in-game screenshots in /public/images/cod)
  {
    name: "Call of Duty Warzone Top 250 Competitor Account",
    brand: 'Call of Duty',
    category: 'call-of-duty',
    price: 749,
    originalPrice: 949,
    images: ["/images/cod/cod-warzone-top250.png"],
    stock: 1,
    rating: 4.9,
    reviewCount: 16,
    soldCount: 11,
    featured: true,
    age: 0,
    description:
      "Rare Warzone account with the \"WZ Top 250 Competitor\" operator skin, earned by finishing a Ranked Play season in the Top 250. Also includes ranked reward skins such as Gold, Platinum and Diamond Comp.",
    specifications: [
      ["Game", "Call of Duty: Warzone"],
      ["Highlight", "WZ Top 250 Competitor skin"],
      ["Ranked rewards", "Gold · Platinum · Diamond Comp skins"],
      ["Login", "Activision ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "Call of Duty Mobile Mythic Collector Account — Tier 400",
    brand: 'Call of Duty',
    category: 'call-of-duty',
    price: 699,
    originalPrice: 869,
    images: ["/images/cod/cod-mythic-collector-tier400.png"],
    stock: 1,
    rating: 4.9,
    reviewCount: 19,
    soldCount: 14,
    featured: true,
    age: 1,
    description:
      "Tier 400 account with a Mythic operator, 4 Mythic weapons on display, a Mythic vehicle skin and 14,673 profile likes.",
    specifications: [
      ["Game", "Call of Duty: Mobile"],
      ["Profile tier", "400"],
      ["Mythic weapons", "4"],
      ["Profile likes", "14,673"],
      ["Login", "Activision ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "Call of Duty Mobile Level 410 Account — 514K Credits",
    brand: 'Call of Duty',
    category: 'call-of-duty',
    price: 599,
    originalPrice: 749,
    images: ["/images/cod/cod-level-410.png"],
    stock: 1,
    rating: 4.7,
    reviewCount: 13,
    soldCount: 16,
    featured: false,
    age: 3,
    description:
      "Level 410 account with 514,287 credits banked, a Mythic weapon, a Legendary zombie-themed operator and access to Ranked, Battle Royale and DMZ: Recon.",
    specifications: [
      ["Game", "Call of Duty: Mobile"],
      ["Player level", "410"],
      ["Credits", "514,287"],
      ["Highlight", "Mythic weapon"],
      ["Login", "Activision ID transfer"],
    ],
  },
  {
    name: "Call of Duty Mobile Legendary Loadout Account",
    brand: 'Call of Duty',
    category: 'call-of-duty',
    price: 549,
    originalPrice: 679,
    images: ["/images/cod/cod-legendary-loadout.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 10,
    soldCount: 13,
    featured: false,
    age: 6,
    description:
      "Legendary operator with a fully built multiplayer loadout, an upgraded legendary weapon and a complete perk setup.",
    specifications: [
      ["Game", "Call of Duty: Mobile"],
      ["Highlight", "Legendary operator + weapon"],
      ["Login", "Activision ID transfer"],
      ["Delivery", "Within 24 hours"],
    ],
  },
  {
    name: "Call of Duty Mobile Skull Operator Account — Battle Pass Tier 171",
    brand: 'Call of Duty',
    category: 'call-of-duty',
    price: 499,
    originalPrice: 619,
    images: ["/images/cod/cod-skull-operator-bp171.png"],
    stock: 1,
    rating: 4.6,
    reviewCount: 9,
    soldCount: 12,
    featured: false,
    age: 9,
    description:
      "Battle Pass tier 171 account with a dual-wield Skull operator and access to the current Ranked, Multiplayer and Battle Royale modes.",
    specifications: [
      ["Game", "Call of Duty: Mobile"],
      ["Battle Pass tier", "171"],
      ["Highlight", "Skull operator skin"],
      ["Login", "Activision ID transfer"],
    ],
  },
];

export const DEMO_PRODUCTS = RAW_PRODUCTS.map((p, i) => ({
  _id: `demo-${i + 1}`,
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name: p.name,
  brand: p.brand,
  description: p.description,
  price: p.price,
  originalPrice: p.originalPrice,
  category: cat(p.category),
  images: p.images.map((key) => (key.startsWith('/') ? key : photo(key))),
  stock: p.stock,
  rating: p.rating,
  reviewCount: p.reviewCount,
  soldCount: p.soldCount,
  featured: p.featured,
  specifications: p.specifications.map(([label, value]) => ({ label, value })),
  createdAt: daysAgo(p.age),
}));

const REVIEWERS = ['Aarav S.', 'Nihal K.', 'Rahul M.', 'Sneha R.', 'Vishnu P.', 'Adil G.'];
const COMMENTS = [
  'Got the login details within a few hours. Everything matched the listing exactly.',
  'Smooth transfer, the seller helped me change the linked email. Highly recommended.',
  'Account is exactly as described. Already pushing ranks with it!',
  'Great price compared to other sites. Support replied quickly on WhatsApp.',
  'Took a day to receive, but all items and skins were there. Happy with it.',
];

export function getDemoReviews(productId) {
  const index = DEMO_PRODUCTS.findIndex((p) => p._id === productId);
  if (index === -1) return [];
  return [0, 1, 2].map((n) => {
    const seed = index + n;
    return {
      _id: `${productId}-review-${n}`,
      user: { _id: `demo-user-${seed % REVIEWERS.length}`, name: REVIEWERS[seed % REVIEWERS.length] },
      rating: [5, 4, 5, 4, 5][seed % 5],
      comment: COMMENTS[seed % COMMENTS.length],
      createdAt: daysAgo(3 + seed * 4),
    };
  });
}

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  popular: (a, b) => b.soldCount - a.soldCount,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

/** Mirrors GET /api/products filtering, sorting and pagination. */
export function queryDemoProducts(params = {}) {
  const search = String(params.search || '').trim().toLowerCase();
  const min = params.minPrice !== undefined && params.minPrice !== '' ? Number(params.minPrice) : null;
  const max = params.maxPrice !== undefined && params.maxPrice !== '' ? Number(params.maxPrice) : null;
  const limit = Math.min(Math.max(Number.parseInt(params.limit, 10) || 12, 1), 50);
  const requestedPage = Math.max(Number.parseInt(params.page, 10) || 1, 1);

  let results = DEMO_PRODUCTS.filter((p) => {
    if (search && !`${p.name} ${p.brand} ${p.category.name}`.toLowerCase().includes(search)) return false;
    if (params.category && p.category.slug !== params.category) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    if (String(params.featured) === 'true' && !p.featured) return false;
    if (String(params.inStock) === 'true' && p.stock <= 0) return false;
    return true;
  });

  results = [...results].sort(SORTERS[params.sort] || SORTERS.newest);
  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(requestedPage, pages);

  return { products: results.slice((page - 1) * limit, page * limit), page, pages, total };
}

export function getDemoCategories() {
  return DEMO_CATEGORIES.map((c) => ({
    ...c,
    productCount: DEMO_PRODUCTS.filter((p) => p.category.slug === c.slug).length,
  }));
}
