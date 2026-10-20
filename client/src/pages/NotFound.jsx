import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text font-display text-8xl font-extrabold text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          The page you&apos;re looking for may have moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home size={16} /> Back to home
          </Link>
          <Link to="/shop" className="btn-outline">
            <Search size={16} /> Browse products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
