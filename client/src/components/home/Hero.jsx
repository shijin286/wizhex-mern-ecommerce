import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Gamepad2, ShieldCheck, Star } from 'lucide-react';
import { handleImageError } from '../../utils/format.js';

const unsplash = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const HERO_IMAGES = {
  main: '/images/hero-wizard.webp',
  top: '/images/coc/coc-th17-legend.webp',
  bottom: unsplash('photo-1493711662062-fa541adb3fc8', 300),
};

const GAMES = ['Clash of Clans', 'PUBG Mobile', 'eFootball', 'Call of Duty'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' } }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-violet-50">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="badge border border-brand-200 bg-white px-3 py-1.5 text-brand-700 shadow-sm"
          >
            <Gamepad2 size={14} /> Verified game accounts — up to 30% off
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Level up instantly with{' '}
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              premium game accounts.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-5 max-w-lg text-base text-slate-600 sm:text-lg"
          >
            Skip the grind. Buy hand-checked accounts with maxed bases, rare skins and top ranks, delivered securely to
            your own login within 24 hours.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-6 flex flex-wrap gap-2">
            {GAMES.map((game) => (
              <span key={game} className="badge border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
                {game}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary group px-7 py-3.5 text-base">
              Browse Accounts
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/categories" className="btn-outline px-7 py-3.5 text-base">
              Choose a Game
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-900">2,500+</p>
              <p className="text-sm text-slate-500">Accounts delivered</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="flex items-center gap-1 font-display text-2xl font-extrabold text-slate-900">
                4.8 <Star size={18} className="fill-amber-400 text-amber-400" />
              </p>
              <p className="text-sm text-slate-500">Buyer rating</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="font-display text-2xl font-extrabold text-slate-900">24h</p>
              <p className="text-sm text-slate-500">Account handover</p>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-900/20 sm:aspect-[4/3]"
          >
            <img
              src={HERO_IMAGES.main}
              alt="Gamer in a neon-lit WIZARD gaming room"
              onError={handleImageError}
              className="h-full w-full object-cover"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute -right-2 top-8 hidden w-44 rounded-2xl bg-white p-2 shadow-xl sm:block lg:-right-6"
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <img
                src={HERO_IMAGES.top}
                alt="Clash of Clans Town Hall 17 base"
                onError={handleImageError}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <p className="mt-2 px-1 text-xs font-semibold text-slate-900">COC TH17 Legend Account</p>
              <p className="px-1 pb-1 text-xs font-bold text-brand-600">Only $499</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="absolute -left-2 bottom-10 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl lg:-left-8"
          >
            <img
              src={HERO_IMAGES.bottom}
              alt="Friends playing a football video game"
              onError={handleImageError}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs text-slate-500">Trending now</p>
              <p className="text-sm font-bold text-slate-900">eFootball Epic Squads</p>
              <p className="flex items-center gap-1 text-xs text-emerald-600">
                <ShieldCheck size={12} /> Safe handover
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur sm:flex"
          >
            <BadgeCheck size={14} className="text-emerald-400" /> Every account hand-checked
          </motion.div>
        </div>
      </div>
    </section>
  );
}
