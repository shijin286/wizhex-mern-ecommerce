import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import ErrorState from '../../components/ErrorState.jsx';
import Pagination from '../../components/Pagination.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useFetch from '../../hooks/useFetch.js';
import { fetchAdminUsers } from '../../services/adminService.js';
import { formatDate, formatPrice, getInitials } from '../../utils/format.js';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim(), 400);
  const { data, loading, error, reload } = useFetch(() => fetchAdminUsers({ search: debounced, page, limit: 15 }), [debounced, page]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-xl">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email"
          className="input pl-10"
          aria-label="Search customers"
        />
      </div>

      {error ? (
        <ErrorState title="Couldn't load customers" message={error} onRetry={reload} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Total spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && !data ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8" /></td></tr>
                  ))
                ) : data.users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No customers found.</td></tr>
                ) : (
                  data.users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{getInitials(user.name)}</span>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.role === 'admin' ? (
                          <span className="badge bg-brand-50 text-brand-700"><ShieldCheck size={12} /> Admin</span>
                        ) : (
                          <span className="badge bg-slate-100 text-slate-600">Customer</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">{user.orderCount}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(user.totalSpent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
