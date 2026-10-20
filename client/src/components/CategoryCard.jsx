import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Castle, Crosshair, Gamepad2, Target, Trophy } from 'lucide-react';
import { handleImageError } from '../utils/format.js';

export const CATEGORY_ICONS = {
  'clash-of-clans': Castle,
  'pubg-mobile': Crosshair,
  efootball: Trophy,
  'call-of-duty': Target,
};

export default function CategoryCard({ category, index = 0, tall = false }) {
  const Icon = CATEGORY_ICONS[category.slug] || Gamepad2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to={`/shop?category=${category.slug}`}
        className={`group relative block overflow-hidden rounded-2xl bg-slate-200 ${tall ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}
      >
        {category.image && (
          <img
            src={category.image}
            alt=""
            loading="lazy"
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
        <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-brand-600 shadow-sm backdrop-blur">
          <Icon size={20} />
        </span>
        <span className="absolute right-4 top-4 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white text-slate-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="text-lg font-bold text-white sm:text-xl">{category.name}</h3>
          {typeof category.productCount === 'number' && (
            <p className="mt-0.5 text-sm text-white/80">
              {category.productCount} {category.productCount === 1 ? 'account' : 'accounts'}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
