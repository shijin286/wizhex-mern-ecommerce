import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useWishlist } from '../hooks/useWishlist.js';

export default function Wishlist() {
  const { products, loading, count } = useWishlist();

  return (
    <>
      <PageHeader
        title="My Wishlist"
        subtitle={count ? `${count} saved ${count === 1 ? 'item' : 'items'}` : 'Save products you love for later.'}
        crumbs={[{ label: 'Wishlist' }]}
      />
      <div className="container-page py-10">
        {!loading && products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here and come back to it anytime."
            action={
              <Link to="/shop" className="btn-primary">
                Discover products
              </Link>
            }
          />
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={4} />
        )}
      </div>
    </>
  );
}
