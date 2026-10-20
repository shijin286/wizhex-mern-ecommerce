import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import useDebounce from '../hooks/useDebounce.js';
import useFetch from '../hooks/useFetch.js';
import { fetchCategories, fetchProducts } from '../services/productService.js';
import { getErrorMessage, isCancel } from '../services/api.js';
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '../utils/constants.js';
import { formatPrice } from '../utils/format.js';

const PRICE_PRESETS = [
  { label: 'Under $400', min: '', max: '400' },
  { label: '$400 – $500', min: '400', max: '500' },
  { label: '$500 – $650', min: '500', max: '650' },
  { label: 'Over $650', min: '650', max: '' },
];

function readFilters(params) {
  const page = Number.parseInt(params.get('page'), 10);
  const sort = params.get('sort');
  return {
    search: params.get('search') || '',
    category: params.get('category') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    inStock: params.get('inStock') === 'true',
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'newest',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function FilterPanel({ filters, categories, categoriesLoading, onChange, onClear, hasActiveFilters }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setPriceError('');
  }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = (event) => {
    event.preventDefault();
    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    if ((min !== null && (Number.isNaN(min) || min < 0)) || (max !== null && (Number.isNaN(max) || max < 0))) {
      setPriceError('Prices must be positive numbers');
      return;
    }
    if (min !== null && max !== null && min > max) {
      setPriceError('Minimum price cannot be more than maximum');
      return;
    }
    setPriceError('');
    onChange({ minPrice: min ?? '', maxPrice: max ?? '' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !filters.category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All categories
            </button>
          </li>
          {categoriesLoading
            ? Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="px-3 py-2">
                  <div className="skeleton h-4 w-3/4" />
                </li>
              ))
            : categories.map((category) => (
                <li key={category._id}>
                  <button
                    type="button"
                    onClick={() => onChange({ category: category.slug })}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      filters.category === category.slug
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {category.name}
                    {typeof category.productCount === 'number' && (
                      <span className="text-xs text-slate-400">{category.productCount}</span>
                    )}
                  </button>
                </li>
              ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">Price</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ minPrice: preset.min, maxPrice: preset.max })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <form onSubmit={applyPrice} noValidate>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="min-price">
              Minimum price
            </label>
            <input
              id="min-price"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input px-3"
            />
            <span className="text-slate-400">–</span>
            <label className="sr-only" htmlFor="max-price">
              Maximum price
            </label>
            <input
              id="max-price"
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input px-3"
            />
          </div>
          {priceError && <p className="field-error">{priceError}</p>}
          <button type="submit" className="btn-dark mt-3 w-full py-2">
            Apply price
          </button>
        </form>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">Availability</h3>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
          />
          In stock only
        </label>
      </div>

      {hasActiveFilters && (
        <button type="button" onClick={onClear} className="btn-outline w-full">
          <X size={16} /> Clear all filters
        </button>
      )}
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput.trim(), 400);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [result, setResult] = useState({ products: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { data: categories, loading: categoriesLoading } = useFetch(fetchCategories, []);

  const updateParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) next.delete(key);
            else next.set(key, String(value));
          });
          // Any filter change returns to page 1.
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace: !('page' in updates) },
      );
    },
    [setSearchParams],
  );

  // Keep the input in sync when the URL search changes elsewhere (e.g. navbar search).
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) updateParams({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch products whenever the URL filters change.
  const queryKey = searchParams.toString();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchProducts(
      {
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock ? 'true' : '',
        sort: filters.sort,
        page: filters.page,
        limit: PRODUCTS_PER_PAGE,
      },
      controller.signal,
    )
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancel(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, reloadKey]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const goToPage = (page) => {
    updateParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategory = categories?.find((c) => c.slug === filters.category);
  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.inStock,
  );

  const chips = [
    filters.search && { key: 'search', label: `“${filters.search}”` },
    filters.category && { key: 'category', label: activeCategory?.name || filters.category },
    (filters.minPrice || filters.maxPrice) && {
      key: 'price',
      label: `${filters.minPrice ? formatPrice(filters.minPrice) : '$0'} – ${
        filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any'
      }`,
    },
    filters.inStock && { key: 'inStock', label: 'In stock' },
  ].filter(Boolean);

  const removeChip = (key) => {
    if (key === 'price') updateParams({ minPrice: '', maxPrice: '' });
    else if (key === 'search') {
      setSearchInput('');
      updateParams({ search: '' });
    } else updateParams({ [key]: '' });
  };

  const from = result.total === 0 ? 0 : (result.page - 1) * PRODUCTS_PER_PAGE + 1;
  const to = Math.min(result.page * PRODUCTS_PER_PAGE, result.total);

  const panelProps = {
    filters,
    categories: categories || [],
    categoriesLoading,
    onChange: updateParams,
    onClear: clearFilters,
    hasActiveFilters,
  };

  return (
    <>
      <PageHeader
        title={activeCategory ? activeCategory.name : filters.search ? 'Search results' : 'All Game Accounts'}
        subtitle={
          activeCategory?.description || 'Browse every account. Filter by game, price and availability.'
        }
        crumbs={activeCategory ? [{ label: 'Shop', to: '/shop' }, { label: activeCategory.name }] : [{ label: 'Shop' }]}
        image={activeCategory?.image}
      />

      <div className="container-page py-8 lg:py-10">
        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-28">
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <label htmlFor="shop-search" className="sr-only">
                  Search products
                </label>
                <input
                  id="shop-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search accounts…"
                  className="input pl-10"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setFiltersOpen(true)} className="btn-outline flex-1 lg:hidden">
                  <SlidersHorizontal size={16} /> Filters
                  {chips.length > 0 && <span className="badge bg-brand-600 px-2 py-0.5 text-white">{chips.length}</span>}
                </button>
                <label htmlFor="sort" className="sr-only">
                  Sort products
                </label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
                  className="input w-auto flex-1 cursor-pointer pr-8 sm:flex-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex min-h-[2rem] flex-wrap items-center gap-2">
              <p className="mr-2 text-sm text-slate-500" aria-live="polite">
                {loading ? (
                  'Loading accounts…'
                ) : error ? (
                  ''
                ) : (
                  <>
                    Showing <span className="font-semibold text-slate-900">{from}–{to}</span> of{' '}
                    <span className="font-semibold text-slate-900">{result.total}</span>{' '}
                    {result.total === 1 ? 'account' : 'accounts'}
                  </>
                )}
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="badge border border-slate-200 bg-white py-1.5 text-slate-700 hover:border-slate-300"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  {chip.label} <X size={12} />
                </button>
              ))}
              {chips.length > 1 && (
                <button type="button" onClick={clearFilters} className="text-sm font-semibold text-brand-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-6">
              {error ? (
                <ErrorState title="Couldn't load products" message={error} onRetry={() => setReloadKey((k) => k + 1)} />
              ) : !loading && result.products.length === 0 ? (
                <EmptyState
                  icon={PackageSearch}
                  title="No accounts found"
                  description={
                    hasActiveFilters
                      ? 'We couldn’t find anything matching your filters. Try a different search term or widen the price range.'
                      : 'There are no products in the store yet.'
                  }
                  action={
                    hasActiveFilters && (
                      <button type="button" onClick={clearFilters} className="btn-primary">
                        Clear filters
                      </button>
                    )
                  }
                />
              ) : (
                <>
                  <ProductGrid products={result.products} loading={loading} columns={3} skeletonCount={6} />
                  {!loading && <Pagination page={result.page} pages={result.pages} onChange={goToPage} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button type="button" className="btn-icon" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <FilterPanel {...panelProps} />
              </div>
              <div className="border-t border-slate-100 p-4">
                <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary w-full">
                  Show {result.total} {result.total === 1 ? 'result' : 'results'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
