import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorState from '../../components/ErrorState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import OrderItemsList from '../../components/OrderItemsList.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useFetch from '../../hooks/useFetch.js';
import { fetchAdminOrders, updateOrderStatus } from '../../services/adminService.js';
import { getErrorMessage } from '../../services/api.js';
import { formatDate, formatPrice } from '../../utils/format.js';
import { orderNumber, ORDER_STATUS, PAYMENT_METHOD_LABEL } from '../../utils/orders.js';

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState(params.get('search') || '');
  const debounced = useDebounce(search.trim(), 400);
  const [viewing, setViewing] = useState(null);
  const [action, setAction] = useState(null); // { order, status }
  const [busy, setBusy] = useState(false);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (debounced !== (params.get('search') || '')) setParam('search', debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, loading, error, reload } = useFetch(
    () => fetchAdminOrders({ status, search: params.get('search') || '', page, limit: 15 }),
    [params.toString()],
  );

  const applyStatus = async () => {
    setBusy(true);
    try {
      const updated = await updateOrderStatus(action.order._id, action.status);
      toast.success(`Order ${orderNumber(updated._id)} marked ${updated.orderStatus}`);
      setAction(null);
      if (viewing?._id === updated._id) setViewing(updated);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const actionsFor = (order) => [
    order.orderStatus === 'processing' && order.paymentStatus === 'paid' && { label: 'Mark delivered', status: 'delivered' },
    ['pending', 'processing'].includes(order.orderStatus) && { label: 'Cancel', status: 'cancelled', danger: true },
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer name or email"
            className="input pl-10"
            aria-label="Search orders"
          />
        </div>
        <select value={status} onChange={(e) => setParam('status', e.target.value)} className="input sm:w-56" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState title="Couldn't load orders" message={error} onRetry={reload} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-6" /></td></tr>
                  ))
                ) : data.orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No orders match these filters.</td></tr>
                ) : (
                  data.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">{orderNumber(order._id)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{order.contact.fullName}</p>
                        <p className="text-xs text-slate-500">{order.contact.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                      <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" className="btn-ghost px-2.5 py-1.5" onClick={() => setViewing(order)} aria-label={`View ${orderNumber(order._id)}`}>
                            <Eye size={16} />
                          </button>
                          {actionsFor(order).map((a) => (
                            <button
                              key={a.status}
                              type="button"
                              onClick={() => setAction({ order, ...a })}
                              className={a.danger ? 'btn-ghost px-2.5 py-1.5 text-rose-600' : 'btn-outline px-2.5 py-1.5'}
                            >
                              {a.label}
                            </button>
                          ))}
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

      {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => setParam('page', String(p))} />}

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? `Order ${orderNumber(viewing._id)}` : ''} size="lg">
        {viewing && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={viewing.orderStatus} />
              <StatusBadge status={viewing.paymentStatus} type="payment" />
              {viewing.payment?.isTest && <span className="badge bg-amber-50 text-amber-800 ring-1 ring-amber-200">TEST payment</span>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Customer</p>
                <p className="mt-1 text-slate-600">{viewing.contact.fullName}</p>
                <p className="text-slate-600">{viewing.contact.email}</p>
                <p className="text-slate-600">{viewing.contact.phone} · {viewing.contact.country}</p>
                <p className="text-slate-600">Prefers <span className="capitalize">{viewing.contact.preferredContact}</span></p>
                {viewing.contact.notes && <p className="mt-2 text-slate-600">“{viewing.contact.notes}”</p>}
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Payment</p>
                <p className="mt-1 text-slate-600">{PAYMENT_METHOD_LABEL[viewing.paymentMethod]}</p>
                <p className="text-slate-600">Total {formatPrice(viewing.totalAmount)}</p>
                {viewing.payment?.providerPaymentId && <p className="break-all text-xs text-slate-500">Ref {viewing.payment.providerPaymentId}</p>}
                <p className="text-slate-600">Placed {formatDate(viewing.createdAt)}</p>
              </div>
            </div>
            <OrderItemsList items={viewing.items} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.status === 'delivered' ? 'Mark as delivered?' : 'Cancel this order?'}
        message={
          action?.status === 'delivered'
            ? 'Confirm that the account login has been handed over to the customer.'
            : 'The account goes back on sale. If the order was paid, the payment is marked as refunded.'
        }
        confirmLabel={action?.label}
        danger={action?.status === 'cancelled'}
        busy={busy}
        onConfirm={applyStatus}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}
