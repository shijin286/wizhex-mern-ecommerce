import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { handleImageError } from '../../utils/format.js';

const PROMOS = [
  {
    eyebrow: 'Top ranks',
    title: 'PUBG Conqueror & Ace accounts',
    text: 'Mythic outfits, upgraded guns and rare vehicle skins, ready to drop in.',
    cta: 'Shop PUBG Mobile',
    to: '/shop?category=pubg-mobile&sort=popular',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-slate-950/90 via-slate-900/70 to-transparent',
  },
  {
    eyebrow: 'Epic squads',
    title: 'eFootball accounts from $300',
    text: 'High team strength and Epic cards. Start winning in Division 1.',
    cta: 'Shop eFootball',
    to: '/shop?category=efootball&sort=newest',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-brand-950/90 via-brand-900/70 to-transparent',
  },
];

export default function PromoBanners() {
  return (
    <section className="section pt-0">
      <div className="container-page grid gap-5 md:grid-cols-2">
        {PROMOS.map((promo, i) => (
          <motion.div
            key={promo.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative min-h-[260px] overflow-hidden rounded-3xl bg-slate-900 sm:min-h-[300px]"
          >
            <img
              src={promo.image}
              alt=""
              loading="lazy"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient}`} />
            <div className="relative flex h-full max-w-sm flex-col justify-center p-7 sm:p-10">
              <span className="badge w-fit bg-amber-400 text-slate-900">
                <Zap size={12} /> {promo.eyebrow}
              </span>
              <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">{promo.title}</h3>
              <p className="mt-2 text-sm text-white/80">{promo.text}</p>
              <Link to={promo.to} className="btn mt-6 w-fit bg-white text-slate-900 hover:bg-slate-100">
                {promo.cta} <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
