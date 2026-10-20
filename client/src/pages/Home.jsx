import Hero from '../components/home/Hero.jsx';
import FeaturesStrip from '../components/home/FeaturesStrip.jsx';
import CategoryGrid from '../components/home/CategoryGrid.jsx';
import ProductSection from '../components/home/ProductSection.jsx';
import PromoBanners from '../components/home/PromoBanners.jsx';
import DealBanner from '../components/home/DealBanner.jsx';
import Newsletter from '../components/Newsletter.jsx';

// Params objects are module constants so they keep a stable identity.
const TRENDING = { featured: 'true', sort: 'rating', limit: 8 };
const BEST_SELLERS = { sort: 'popular', limit: 4 };
const NEW_ARRIVALS = { sort: 'newest', limit: 8 };

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesStrip />
      <CategoryGrid />
      <ProductSection
        eyebrow="Hot right now"
        title="Trending Accounts"
        subtitle="Premium accounts gamers are grabbing this week."
        params={TRENDING}
        linkTo="/shop?sort=rating"
        className="bg-slate-50/70"
      />
      <DealBanner />
      <ProductSection
        eyebrow="Most loved"
        title="Best Sellers"
        subtitle="Our most popular accounts, ranked by number sold."
        params={BEST_SELLERS}
        linkTo="/shop?sort=popular"
      />
      <PromoBanners />
      <ProductSection
        eyebrow="Just listed"
        title="New Arrivals"
        subtitle="Freshly verified accounts — grab them before they're gone."
        params={NEW_ARRIVALS}
        linkTo="/shop?sort=newest"
        className="bg-slate-50/70"
      />
      <Newsletter />
    </>
  );
}
