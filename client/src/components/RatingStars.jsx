import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, size = 14, count, showValue = false }) {
  const value = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((position) => {
          const fill = Math.max(0, Math.min(1, value - (position - 1)));
          return (
            <span key={position} className="relative inline-block" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-slate-200" fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-semibold text-slate-800">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-slate-500">({count.toLocaleString('en-IN')})</span>}
    </div>
  );
}
