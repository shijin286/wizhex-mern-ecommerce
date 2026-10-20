import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../utils/constants.js';
import { formatPrice, handleImageError } from '../utils/format.js';

export default function OrderItemsList({ items, linkItems = true }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const name = <span className="line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</span>;
        return (
          <li key={`${item.product}-${item.name}`} className="flex items-center gap-4 py-4">
            <img
              src={item.image || PLACEHOLDER_IMAGE}
              alt=""
              onError={handleImageError}
              className="h-16 w-20 flex-shrink-0 rounded-xl bg-slate-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              {linkItems ? (
                <Link to={`/product/${item.product}`} className="hover:text-brand-600">
                  {name}
                </Link>
              ) : (
                name
              )}
              <p className="text-xs text-slate-500">
                {item.game} · {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
          </li>
        );
      })}
    </ul>
  );
}
