import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, LogOut, Menu, Package, Store, Users, X, ClipboardList } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { useAuth } from '../hooks/useAuth.js';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Listings', icon: Package },
  { to: '/admin/categories', label: 'Games', icon: Gamepad2 },
  { to: '/admin/users', label: 'Customers', icon: Users },
];

function SideNav({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo light onClick={onNavigate} />
        <p className="mt-1 pl-11 text-xs font-semibold uppercase tracking-wider text-brand-300">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
          <Store size={18} /> Back to store
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} /> Log out
        </button>
        <p className="truncate px-3 pt-2 text-xs text-slate-500">{user?.email}</p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const current = LINKS.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)));

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-slate-950 lg:block">
        <SideNav />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950">
            <button type="button" className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:text-white" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
            <SideNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="btn-icon lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold">{current?.label || 'Admin'}</h1>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
