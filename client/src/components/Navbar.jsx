import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  User,
  X,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from './Logo.jsx';
import SearchBar from './SearchBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import useClickOutside from '../hooks/useClickOutside.js';
import { NAV_LINKS } from '../utils/constants.js';
import { getInitials } from '../utils/format.js';

const linkClass = ({ isActive }) =>
  `relative px-1 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
  }`;

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}

function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('You have been logged out');
    navigate('/');
  };

  const items = [
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/orders', label: 'My Orders', icon: Package },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-[7rem] truncate text-sm font-medium text-slate-700 xl:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="py-1">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={16} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMobileLogout = () => {
    logout();
    toast.success('You have been logged out');
    navigate('/');
  };

  return (
    <>
      <div className="bg-slate-900 text-white">
        <div className="container-page flex h-9 items-center justify-center gap-2 text-xs font-medium sm:text-sm">
          <Zap size={14} className="text-brand-300" />
          Fast account handover · 7-day guarantee · Secure transfer
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-lg transition-shadow ${
          scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="container-page flex h-16 items-center gap-4 lg:h-[72px] lg:gap-8">
          <button
            type="button"
            className="btn-icon -ml-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand-600"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <SearchBar className="hidden max-w-md flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link to="/wishlist" className="btn-icon relative hidden sm:inline-grid" aria-label="Wishlist">
              <Heart size={21} />
              <CountBadge count={wishlistCount} />
            </Link>
            <Link to="/cart" className="btn-icon relative" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingBag size={21} />
              <CountBadge count={itemCount} />
            </Link>

            {user ? (
              <div className="hidden lg:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/login" className="btn-ghost px-4">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary px-4">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="container-page pb-3 md:hidden">
          <SearchBar />
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <Logo onClick={() => setMobileOpen(false)} />
                <button type="button" className="btn-icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                {user && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {getInitials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                )}

                <nav aria-label="Mobile" className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base font-medium ${
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="my-4 border-t border-slate-100" />

                <div className="space-y-1">
                  <Link to="/wishlist" className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-3">
                      <Heart size={18} /> Wishlist
                    </span>
                    {wishlistCount > 0 && <span className="badge bg-brand-100 text-brand-700">{wishlistCount}</span>}
                  </Link>
                  <Link to="/cart" className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-3">
                      <ShoppingBag size={18} /> Cart
                    </span>
                    {itemCount > 0 && <span className="badge bg-brand-100 text-brand-700">{itemCount}</span>}
                  </Link>
                  {user && (
                    <>
                      <Link to="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50">
                        <User size={18} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50">
                        <Package size={18} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50">
                          <LayoutDashboard size={18} /> Admin Dashboard
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 p-4">
                {user ? (
                  <button type="button" onClick={handleMobileLogout} className="btn-outline w-full text-rose-600">
                    <LogOut size={16} /> Log out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="btn-outline">
                      Log in
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
