import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Spinner from './Spinner.jsx';
import useDebounce from '../hooks/useDebounce.js';
import useClickOutside from '../hooks/useClickOutside.js';
import { fetchProducts } from '../services/productService.js';
import { isCancel } from '../services/api.js';
import { formatPrice, getCategoryName, getProductImage, handleImageError } from '../utils/format.js';

export default function SearchBar({ className = '', onNavigate, autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query.trim(), 300);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const listId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    fetchProducts({ search: debouncedQuery, limit: 6 }, controller.signal)
      .then((data) => {
        setResults(data.products);
        setActiveIndex(-1);
        setLoading(false);
      })
      .catch((error) => {
        if (isCancel(error)) return;
        setResults([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const finish = () => {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
  };

  const goToProduct = (product) => {
    navigate(`/product/${product._id}`);
    setQuery('');
    finish();
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      goToProduct(results[activeIndex]);
      return;
    }
    const term = query.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
    finish();
  };

  const handleKeyDown = (event) => {
    if (!open || results.length === 0) {
      if (event.key === 'Escape') setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && debouncedQuery.length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={submitSearch} role="search">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search COC, PUBG, eFootball, Call of Duty…"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          className="w-full rounded-full border border-slate-200 bg-slate-100/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
                <Spinner size={16} className="text-brand-600" /> Searching…
              </div>
            ) : results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">
                No products match &ldquo;{debouncedQuery}&rdquo;
              </p>
            ) : (
              <>
                <ul id={listId} role="listbox" className="max-h-96 overflow-y-auto py-2">
                  {results.map((product, index) => (
                    <li
                      key={product._id}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goToProduct(product)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${
                        index === activeIndex ? 'bg-brand-50' : ''
                      }`}
                    >
                      <img
                        src={getProductImage(product)}
                        alt=""
                        onError={handleImageError}
                        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{getCategoryName(product)}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{formatPrice(product.price)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={submitSearch}
                  className="w-full border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-slate-50"
                >
                  See all results for &ldquo;{query.trim()}&rdquo;
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
