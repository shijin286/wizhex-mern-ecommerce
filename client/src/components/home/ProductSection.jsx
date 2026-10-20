import { PackageSearch } from 'lucide-react';
import SectionHeader from '../SectionHeader.jsx';
import ProductGrid from '../ProductGrid.jsx';
import ErrorState from '../ErrorState.jsx';
import EmptyState from '../EmptyState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { fetchProducts } from '../../services/productService.js';

/** A titled grid of products loaded from the API with the given query params. */
export default function ProductSection({ eyebrow, title, subtitle, params, linkTo, className = '' }) {
  const paramsKey = JSON.stringify(params);
  const { data, loading, error, reload } = useFetch(() => fetchProducts(params), [paramsKey]);
  const products = data?.products ?? [];

  return (
    <section className={`section ${className}`}>
      <div className="container-page">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} linkTo={linkTo} />
        {error ? (
          <ErrorState title={`Couldn't load ${title.toLowerCase()}`} message={error} onRetry={reload} />
        ) : !loading && products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nothing here yet"
            description="New products are on their way. Check back soon!"
          />
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={params.limit || 8} />
        )}
      </div>
    </section>
  );
}
