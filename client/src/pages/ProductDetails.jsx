import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Heart,
  PackageX,
  KeyRound,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import RatingStars from '../components/RatingStars.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductReviews from '../components/ProductReviews.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import useFetch from '../hooks/useFetch.js';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { fetchProduct, fetchProducts } from '../services/productService.js';
import { DELIVERY_PROMISE } from '../utils/constants.js';
import {
  addDays,
  formatDate,
  formatPrice,
  getCategoryName,
  getDiscountPercent,
  getProductImage,
  handleImageError,
} from '../utils/format.js';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'reviews', label: 'Reviews' },
];

function DetailsSkeleton() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
      <div>
        <div className="skeleton aspect-[16/10] rounded-3xl" />
        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function RelatedProducts({ product }) {
  const slug = product.category?.slug;
  const { data, loading } = useFetch(
    () =>
      slug
        ? fetchProducts({ category: slug, limit: 5, sort: 'popular' }).then((res) =>
            res.products.filter((p) => p._id !== product._id).slice(0, 4),
          )
        : Promise.resolve([]),
    [product._id, slug],
  );

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <section className="section border-t border-slate-100">
      <SectionHeader
        eyebrow="You may also like"
        title="Related Products"
        linkTo={slug ? `/shop?category=${slug}` : '/shop'}
      />
      <ProductGrid products={data || []} loading={loading} skeletonCount={4} />
    </section>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, getItemQuantity } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { data: product, loading, error, reload, setData: setProduct } = useFetch(() => fetchProduct(id), [id]);

  // After a new review, refresh the rating without showing the loading skeleton again.
  const refreshProduct = () => {
    fetchProduct(id)
      .then(setProduct)
      .catch(() => {});
  };

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setTab('description');
  }, [id]);

  useEffect(() => {
    if (product) document.title = `${product.name} | WIZHEX`;
    return () => {
      document.title = 'WIZHEX — Premium Game Accounts';
    };
  }, [product]);

  if (loading) return <DetailsSkeleton />;

  if (error) {
    const notFound = /not found/i.test(error);
    return (
      <div className="container-page py-16">
        {notFound ? (
          <EmptyState
            icon={PackageX}
            title="Product not found"
            description="This product may have been removed or the link is incorrect."
            action={
              <Link to="/shop" className="btn-primary">
                Continue shopping
              </Link>
            }
          />
        ) : (
          <ErrorState title="Couldn't load this product" message={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const images = product.images?.length ? product.images : [getProductImage(product)];
  const discount = getDiscountPercent(product.price, product.originalPrice);
  const inCart = getItemQuantity(product._id);
  const availableToAdd = Math.max(0, product.stock - inCart);
  const outOfStock = product.stock <= 0;
  const wished = isWishlisted(product._id);
  const deliveryBy = formatDate(addDays(new Date(), 1), { weekday: 'short', day: 'numeric', month: 'short' });

  const handleAddToCart = () => addItem(product, quantity);

  const handleBuyNow = () => {
    // If the full quantity is already in the cart, go straight to checkout.
    if (availableToAdd === 0 && inCart > 0) {
      navigate('/checkout');
      return;
    }
    if (addItem(product, quantity)) navigate('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className="container-page">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 pt-6 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-600">Shop</Link>
        {product.category?.slug && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-600">
              {getCategoryName(product)}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="line-clamp-1 font-medium text-slate-700" aria-current="page">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 py-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={images[activeImage]}
                alt={`${product.name} — image ${activeImage + 1}`}
                onError={handleImageError}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="h-full w-full object-contain"
              />
            </AnimatePresence>
            {discount > 0 && (
              <span className="badge absolute left-4 top-4 bg-rose-500 px-3 py-1.5 text-sm text-white">
                {discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === activeImage}
                  className={`aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 transition ${
                    index === activeImage ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" onError={handleImageError} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                {product.brand ? `${product.brand} · ` : ''}
                {getCategoryName(product)}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{product.name}</h1>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={handleShare} className="btn-icon border border-slate-200" aria-label="Share product">
                <Share2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="btn-icon border border-slate-200"
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wished}
              >
                <Heart size={18} className={wished ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setTab('reviews');
              document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-3 flex items-center gap-2 hover:opacity-80"
          >
            <RatingStars rating={product.rating} size={18} showValue />
            <span className="text-sm text-slate-500">({product.reviewCount} reviews)</span>
          </button>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="badge bg-emerald-50 text-emerald-700">
                  You save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes</p>

          <p className="mt-6 line-clamp-3 leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-6">
            {outOfStock ? (
              <span className="badge bg-rose-50 px-3 py-1.5 text-rose-700">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge bg-amber-50 px-3 py-1.5 text-amber-700">Hurry — only {product.stock} left in stock</span>
            ) : (
              <span className="badge bg-emerald-50 px-3 py-1.5 text-emerald-700">
                <BadgeCheck size={14} /> In stock ({product.stock} available)
              </span>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <QuantitySelector
                  value={Math.min(quantity, Math.max(1, availableToAdd))}
                  max={Math.max(1, availableToAdd)}
                  onChange={setQuantity}
                  disabled={availableToAdd === 0}
                />
                {inCart > 0 && <span className="text-sm text-slate-500">{inCart} already in your cart</span>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={handleAddToCart} disabled={availableToAdd === 0} className="btn-outline py-3.5 text-base">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button type="button" onClick={handleBuyNow} className="btn-primary py-3.5 text-base">
                  <Zap size={18} /> Buy Now
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            <div className="flex gap-4 p-4">
              <Zap size={22} className="flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Delivered by {deliveryBy}</p>
                <p className="text-sm text-slate-500">{DELIVERY_PROMISE}. No delivery charges.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4">
              <KeyRound size={22} className="flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Full ownership transfer</p>
                <p className="text-sm text-slate-500">We help you link the account to your own email or game ID.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4">
              <ShieldCheck size={22} className="flex-shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">7-day account guarantee</p>
                <p className="text-sm text-slate-500">Full refund if the account doesn&apos;t match the listing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section id="product-tabs" className="scroll-mt-28 pb-12">
        <div role="tablist" aria-label="Product information" className="flex gap-2 overflow-x-auto border-b border-slate-200 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              {t.id === 'reviews' && ` (${product.reviewCount})`}
              {tab === t.id && (
                <motion.span layoutId="product-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
              )}
            </button>
          ))}
        </div>

        <div className="pt-8" role="tabpanel">
          {tab === 'description' && (
            <div className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-600">{product.description}</div>
          )}

          {tab === 'specifications' &&
            (product.specifications?.length ? (
              <dl className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200">
                {product.specifications.map((spec, i) => (
                  <div key={spec.label} className={`grid grid-cols-3 gap-4 px-5 py-3.5 text-sm ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <dt className="font-medium text-slate-500">{spec.label}</dt>
                    <dd className="col-span-2 text-slate-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-slate-500">No specifications are available for this product.</p>
            ))}

          {tab === 'reviews' && <ProductReviews product={product} onReviewAdded={refreshProduct} />}
        </div>
      </section>

      <RelatedProducts product={product} />
    </div>
  );
}
