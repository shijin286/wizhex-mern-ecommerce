import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import RatingStars from './RatingStars.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import {
  formatPrice,
  getCategoryName,
  getDiscountPercent,
  getProductImage,
  handleImageError,
} from '../utils/format.js';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const discount = getDiscountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const wished = isWishlisted(product._id);
  const productUrl = `/product/${product._id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="card group flex flex-col overflow-hidden hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link to={productUrl} tabIndex={-1} aria-hidden="true">
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {discount > 0 && (
          <span className="badge absolute left-3 top-3 bg-rose-500 text-white shadow-sm">-{discount}%</span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wished}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Heart size={18} className={wished ? 'fill-rose-500 text-rose-500' : 'text-slate-600'} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[1px]">
            <span className="badge bg-slate-900 px-3 py-1.5 text-white">Out of stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{getCategoryName(product)}</p>
        <Link
          to={productUrl}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900 transition-colors hover:text-brand-600"
        >
          {product.name}
        </Link>

        <div className="mt-2">
          <RatingStars rating={product.rating} count={product.reviewCount ?? 0} />
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <span className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <p
          className={`mt-1 text-xs font-medium ${
            outOfStock ? 'text-rose-600' : lowStock ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          {outOfStock ? 'Currently unavailable' : lowStock ? `Only ${product.stock} left` : 'In stock'}
        </p>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addItem(product, 1)}
          className="btn-primary mt-4 w-full"
        >
          <ShoppingCart size={16} />
          {outOfStock ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </motion.article>
  );
}
