import { useState } from 'react';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorState from '../../components/ErrorState.jsx';
import Pagination from '../../components/Pagination.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import ProductForm from './ProductForm.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useFetch from '../../hooks/useFetch.js';
import { createProduct, deleteProduct, fetchAdminProducts, updateProduct } from '../../services/adminService.js';
import { fetchCategories } from '../../services/productService.js';
import { getErrorMessage } from '../../services/api.js';
import { formatPrice, getProductImage, handleImageError } from '../../utils/format.js';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 400);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: categories } = useFetch(fetchCategories, []);
  const { data, loading, error, reload } = useFetch(
    () => fetchAdminProducts({ search: debounced, category, page, limit: 12, sort: 'newest' }),
    [debounced, category, page],
  );

  const save = async (payload) => {
    if (editing === 'new') {
      await createProduct(payload);
      toast.success('Listing created');
    } else {
      await updateProduct(editing._id, payload);
      toast.success('Listing updated');
    }
    setEditing(null);
    reload();
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteProduct(toDelete._id);
      toast.success('Listing removed from the store');
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search listings"
            className="input pl-10"
            aria-label="Search listings"
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input lg:w-56" aria-label="Filter by game">
          <option value="">All games</option>
          {(categories || []).map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')} disabled={!categories?.length}>
          <Plus size={18} /> Add listing
        </button>
      </div>

      {error ? (
        <ErrorState title="Couldn't load listings" message={error} onRetry={reload} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && !data ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-10" /></td></tr>
                  ))
                ) : data.products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No listings found.</td></tr>
                ) : (
                  data.products.map((product) => (
                    <tr key={product._id} className={product.isActive ? '' : 'bg-slate-50 text-slate-400'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={getProductImage(product)} alt="" onError={handleImageError} className="h-11 w-14 flex-shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-slate-900">{product.name}</p>
                            {product.featured && <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Star size={12} /> Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{product.category?.name}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        {product.stock === 0 ? <span className="badge bg-rose-50 text-rose-700">Sold out</span> : product.stock}
                      </td>
                      <td className="px-4 py-3">
                        {product.isActive ? (
                          <span className="badge bg-emerald-50 text-emerald-700">Active</span>
                        ) : (
                          <span className="badge bg-slate-200 text-slate-600">Hidden</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" className="btn-ghost px-2.5 py-1.5" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}>
                            <Pencil size={16} />
                          </button>
                          {product.isActive && (
                            <button type="button" className="btn-ghost px-2.5 py-1.5 text-rose-600" onClick={() => setToDelete(product)} aria-label={`Delete ${product.name}`}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add listing' : 'Edit listing'} size="xl">
        {editing && categories && (
          <ProductForm product={editing === 'new' ? null : editing} categories={categories} onSubmit={save} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this listing?"
        message={`"${toDelete?.name}" will be hidden from the store. Past orders keep their records, and you can make it visible again by editing it.`}
        confirmLabel="Delete listing"
        danger
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
