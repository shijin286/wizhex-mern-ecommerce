import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, DollarSign, PackageCheck, PackageX, Truck, Users } from 'lucide-react';
import ErrorState from '../../components/ErrorState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import useFetch from '../../hooks/useFetch.js';
import { fetchAdminStats } from '../../services/adminService.js';
import { formatDate, formatPrice } from '../../utils/format.js';
import { orderNumber } from '../../utils/orders.js';

function StatCard({ icon: Icon, label, value, hint, to }) {
  const body = (
    <div className="card h-full p-5 transition hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

// Single-series bar chart: one brand hue, thin rounded bars, hover tooltip, table fallback.
function SalesChart({ data }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Revenue · last 7 days</h2>
        <p className="text-sm text-slate-500">{formatPrice(data.reduce((s, d) => s + d.revenue, 0))} total</p>
      </div>
      <div className="relative mt-6 h-48" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-6 border-t border-slate-200" />
        <div className="absolute inset-0 bottom-6 flex items-end gap-2 sm:gap-4">
          {data.map((d, i) => (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end justify-center"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={`w-full max-w-[36px] rounded-t-[4px] transition-colors ${hover === i ? 'bg-brand-700' : 'bg-brand-500'}`}
                style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue ? 4 : 1)}%` }}
              />
              {hover === i && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                  <p className="font-semibold">{formatDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p>{formatPrice(d.revenue)} · {d.orders} order{d.orders === 1 ? '' : 's'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex gap-2 sm:gap-4">
          {data.map((d) => (
            <span key={d.date} className="flex-1 text-center text-xs text-slate-500">{dayLabel(d.date)}</span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Paid revenue per day for the last 7 days</caption>
        <thead><tr><th>Date</th><th>Revenue</th><th>Orders</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}><td>{d.date}</td><td>{formatPrice(d.revenue)}</td><td>{d.orders}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(fetchAdminStats, []);

  if (error) return <ErrorState title="Couldn't load the dashboard" message={error} onRetry={reload} />;
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );
  }

  const { stats, recentOrders, salesByDay } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={DollarSign} label="Revenue (paid orders)" value={formatPrice(stats.revenue)} />
        <StatCard icon={ClipboardList} label="Orders" value={stats.orders} to="/admin/orders" />
        <StatCard icon={Truck} label="Waiting for handover" value={stats.toDeliver} hint="Paid, not yet delivered" to="/admin/orders?status=processing" />
        <StatCard icon={PackageCheck} label="Active listings" value={stats.products} to="/admin/products" />
        <StatCard icon={PackageX} label="Sold out listings" value={stats.soldOut} to="/admin/products" />
        <StatCard icon={Users} label="Customers" value={stats.users} to="/admin/users" />
      </div>

      <SalesChart data={salesByDay} />

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-3 font-semibold text-slate-900">{orderNumber(order._id)}</td>
                    <td className="px-6 py-3 text-slate-600">{order.contact.fullName}</td>
                    <td className="px-6 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-3"><StatusBadge status={order.orderStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
