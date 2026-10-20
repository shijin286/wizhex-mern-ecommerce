import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { handleImageError } from '../utils/format.js';

/** Page title band with breadcrumbs and an optional cover image. `crumbs` = [{ label, to? }] */
export default function PageHeader({ title, subtitle, crumbs = [], image }) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="container-page flex items-center gap-6 py-8 sm:py-10">
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-600">
              Home
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1">
                <ChevronRight size={14} />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-brand-600">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-slate-500">{subtitle}</p>}
        </div>
        {image && (
          <img
            src={image}
            alt=""
            onError={handleImageError}
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover shadow-lg ring-4 ring-white sm:h-40 sm:w-40 lg:h-48 lg:w-48"
          />
        )}
      </div>
    </div>
  );
}
