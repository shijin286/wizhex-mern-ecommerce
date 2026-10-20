import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, Headphones, KeyRound, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { handleImageError } from '../utils/format.js';

const STATS = [
  { value: '2,500+', label: 'Accounts delivered' },
  { value: '4', label: 'Top mobile games' },
  { value: '24h', label: 'Average handover' },
  { value: '4.8/5', label: 'Buyer rating' },
];

const VALUES = [
  { icon: BadgeCheck, title: 'Hand-checked', text: 'Every account is logged into and verified against its listing before it goes live.' },
  { icon: KeyRound, title: 'Full ownership', text: 'We help you move the account to your own email or game ID, step by step.' },
  { icon: ShieldCheck, title: '7-day guarantee', text: "If the account doesn't match the listing, you get a full refund." },
  { icon: Headphones, title: 'Real support', text: 'Our team is on hand before, during and after every transfer.' },
];

export default function About() {
  return (
    <>
      <PageHeader
        title="About WIZHEX"
        subtitle="We help gamers skip the grind with safe, verified game accounts."
        crumbs={[{ label: 'About' }]}
      />

      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Our story</p>
            <h2 className="mt-2 text-3xl font-extrabold">Built by gamers, for gamers</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-slate-600">
              <p>
                WIZHEX started in Shornur, Kerala, with a simple idea: buying a game account should be as safe as buying
                anything else online. No shady chats, no disappearing sellers.
              </p>
              <p>
                We focus on four games we know inside out: Clash of Clans, PUBG Mobile, eFootball and Call of Duty
                Mobile. Every listing is checked by our team, priced fairly and handed over securely.
              </p>
            </div>
            <Link to="/shop" className="btn-primary mt-8">
              Browse accounts
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl shadow-xl"
          >
            <img
              src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=900&q=80"
              alt="Gamer wearing a headset"
              loading="lazy"
              onError={handleImageError}
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-950 py-14">
        <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="text-center text-3xl font-extrabold">Why buy from WIZHEX</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 hover:shadow-card-hover"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
