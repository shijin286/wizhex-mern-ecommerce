import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, ShoppingBag, Trash2, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { DELIVERY_PROMISE, PLACEHOLDER_IMAGE } from '../utils/constants.js';
import { formatPrice, getDiscountPercent, handleImageError } from '../utils/format.js';

export default function Cart() {
  const {
    items,
    itemCount,
    subtotal,
    mrpTotal,
    savings,
    shipping,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    syncing,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const proceedToCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (syncing && items.length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-brand-600">
        <Spinner size={32} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your Cart" crumbs={[{ label: 'Cart' }]} />
        <div className="container-page py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Explore our products and find something you love."
            action={
              <Link to="/shop" className="btn-primary px-6 py-3">
                Continue Shopping <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your Cart"
        subtitle={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
        crumbs={[{ label: 'Cart' }]}
      />

      <div className="container-page grid gap-8 py-8 lg:grid-cols-3 lg:py-10">
        <div className="lg:col-span-2">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <Zap size={18} className="mt-0.5 flex-shrink-0 text-brand-600" />
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Digital delivery, no delivery charges.</span>{' '}
              {DELIVERY_PROMISE}, then we help you link the account to your own email or game ID.
            </p>
          </div>

          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const discount = getDiscountPercent(item.price, item.originalPrice);
                return (
                  <motion.li
                    key={item.productId}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    className="flex gap-4 p-4 sm:p-5"
                  >
                    <Link
                      to={`/product/${item.productId}`}
                      className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28"
                    >
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        onError={handleImageError}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to={`/product/${item.productId}`}
                          className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600 sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
                        {discount > 0 && (
                          <>
                            <span className="text-xs text-slate-400 line-through">{formatPrice(item.originalPrice)}</span>
                            <span className="text-xs font-semibold text-emerald-600">{discount}% off</span>
                          </>
                        )}
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <div className="flex items-center gap-3">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            max={item.stock}
                            onChange={(qty) => updateQuantity(item.productId, qty)}
                          />
                          {item.quantity >= item.stock && (
                            <span className="text-xs font-medium text-amber-600">Max available</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link to="/shop" className="btn-ghost px-3">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <button type="button" onClick={clearCart} className="text-sm font-medium text-rose-600 hover:underline">
              Clear cart
            </button>
          </div>
        </div>

        <aside>
          <div className="card p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Price ({itemCount} items)</dt>
                <dd className="font-medium text-slate-900">{formatPrice(mrpTotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate-600">Discount</dt>
                  <dd className="font-medium text-emerald-600">−{formatPrice(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery</dt>
                <dd className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-extrabold text-slate-900">{formatPrice(total)}</dd>
              </div>
            </dl>

            {savings > 0 && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
                You save {formatPrice(savings)} on this order
              </p>
            )}

            <button type="button" onClick={proceedToCheckout} className="btn-primary mt-6 w-full py-3.5 text-base">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <Lock size={14} className="mt-0.5 flex-shrink-0" />
              Prices and availability are verified again on our servers when you place your order.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
