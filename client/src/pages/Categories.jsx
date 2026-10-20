import { LayoutGrid } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import useFetch from '../hooks/useFetch.js';
import { fetchCategories } from '../services/productService.js';

export default function Categories() {
  const { data: categories, loading, error, reload } = useFetch(fetchCategories, []);

  return (
    <>
      <PageHeader
        title="All Games"
        subtitle="Pick a game to browse hand-checked accounts, ready for fast handover."
        crumbs={[{ label: 'Games' }]}
      />
      <div className="container-page py-10">
        {error ? (
          <ErrorState title="Couldn't load categories" message={error} onRetry={reload} />
        ) : !loading && categories.length === 0 ? (
          <EmptyState icon={LayoutGrid} title="No categories yet" description="Categories will appear here once added." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />)
              : categories.map((category, index) => (
                  <div key={category._id}>
                    <CategoryCard category={category} index={index} tall />
                    {category.description && (
                      <p className="mt-3 line-clamp-2 px-1 text-sm text-slate-500">{category.description}</p>
                    )}
                  </div>
                ))}
          </div>
        )}
      </div>
    </>
  );
}
