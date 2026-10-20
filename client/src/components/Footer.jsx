import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { SUPPORT } from '../utils/constants.js';

const COLUMNS = [
  {
    title: 'Games',
    links: [
      { to: '/shop', label: 'All Accounts' },
      { to: '/shop?category=clash-of-clans', label: 'Clash of Clans' },
      { to: '/shop?category=pubg-mobile', label: 'PUBG Mobile' },
      { to: '/shop?category=efootball', label: 'eFootball' },
      { to: '/shop?category=call-of-duty', label: 'Call of Duty' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'My Profile' },
      { to: '/orders', label: 'Order History' },
      { to: '/wishlist', label: 'Wishlist' },
      { to: '/cart', label: 'Shopping Cart' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
      { to: '/contact', label: 'Delivery & Refunds' },
      { to: '/contact', label: 'Help Center' },
    ],
  },
];

const SOCIALS = [
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
  { href: 'https://youtube.com', label: 'YouTube', icon: Youtube },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            WIZHEX is a marketplace for hand-checked Clash of Clans, PUBG Mobile, eFootball and Call of Duty
            accounts, with secure handover and a 7-day guarantee.
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title} className="lg:col-span-2">
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sm:col-span-2 lg:col-span-2">
          <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Customer Support</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 flex-shrink-0 text-brand-400" />
              <a href={`tel:${SUPPORT.phone.replace(/\s/g, '')}`} className="hover:text-white">
                {SUPPORT.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 flex-shrink-0 text-brand-400" />
              <a href={`mailto:${SUPPORT.email}`} className="break-all hover:text-white">
                {SUPPORT.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock size={16} className="mt-0.5 flex-shrink-0 text-brand-400" />
              <span>{SUPPORT.hours}</span>
            </li>
            <li className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brand-400" />
              <span>{SUPPORT.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-page pt-6 text-center text-[11px] leading-relaxed text-slate-500 sm:text-left">
          WIZHEX is not affiliated with or endorsed by Supercell, KRAFTON, Konami or Activision. Game names are trademarks
          of their respective owners. Account transfers may be restricted by each game&apos;s terms of service.
        </p>
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>&copy; {new Date().getFullYear()} WIZHEX. Built as a portfolio project. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-slate-300">TEST MODE</span>
            Payments are simulated — no real money is charged.
          </p>
        </div>
      </div>
    </footer>
  );
}
