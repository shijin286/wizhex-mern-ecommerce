import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { handleImageError } from '../utils/format.js';

const PERKS = ['Track your account orders', 'Save accounts to your wishlist', 'Secure handover for every purchase'];

/** Two-column layout shared by the Login and Register pages. */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=900&q=80"
            alt=""
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-brand-800/80 to-violet-900/80" />
          <div className="relative flex h-full flex-col justify-end p-10 text-white">
            <h2 className="text-3xl font-extrabold text-white">Level up with WIZHEX</h2>
            <ul className="mt-6 space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-brand-100">
                  <CheckCircle2 size={18} className="text-emerald-300" /> {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="p-6 sm:p-10"
        >
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
