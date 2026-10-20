import { motion } from 'framer-motion';
import { Headphones, KeyRound, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Fast Handover', text: 'Login details within 24 hours' },
  { icon: KeyRound, title: 'Full Ownership', text: 'Linked to your own email / ID' },
  { icon: ShieldCheck, title: '7-Day Guarantee', text: 'Full refund if anything is wrong' },
  { icon: Headphones, title: '24/7 Support', text: 'Help with every transfer' },
];

export default function FeaturesStrip() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
