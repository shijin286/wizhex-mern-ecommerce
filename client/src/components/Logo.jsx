import { Link } from 'react-router-dom';

export default function Logo({ light = false, onClick }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2" aria-label="WIZHEX home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/30">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <circle cx="32" cy="35" r="15" fill="none" stroke="#fff" strokeWidth="6" />
          <path d="M22 23a10 10 0 0 1 20 0" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        WIZ<span className={light ? 'text-brand-300' : 'text-brand-600'}>HEX</span>
      </span>
    </Link>
  );
}
