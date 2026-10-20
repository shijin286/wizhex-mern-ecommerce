import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useFetch from '../hooks/useFetch.js';
import { fetchMyOrders } from '../services/orderService.js';
import { PLACEHOLDER_IMAGE } from '../utils/constants.js';
import { formatDate, formatPrice, handleImageError } from '../utils/format.js';
import { orderNumber } from '../utils/orders.js';

export default function Orders() {
  const { data: orders, loading, error, reload } = useFetch(fetchMyOrders, []);

  return (
    <>
      <PageHeader title="My Orders" subtitle="Track your purchases and account handovers." crumbs={[{ label: 'Orders' }]} />
      <div className="container-page max-w-4xl py-10">
        {error ? (
          <ErrorState title="Couldn't load your orders" message={error} onRetry={reload} />
        ) : loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you buy an account, it will show up here so you can track the handover."
            action={
              <Link to="/shop" className="btn-primary">
                Browse accounts
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="card flex flex-col gap-4 p-5 transition hover:shadow-card-hover sm:flex-row sm:items-center"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={`${order._id}-${item.product}`}
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt=""
                        onError={handleImageError}
                        className="h-14 w-14 rounded-xl object-cover ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{orderNumber(order._id)}</p>
                    <p className="truncate text-sm text-slate-500">
                      {formatDate(order.createdAt)} · {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={order.orderStatus} />
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="text-lg font-extrabold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <span className="flex items-center text-sm font-semibold text-brand-600">
                      Details <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
