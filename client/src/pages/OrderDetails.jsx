import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CreditCard, FlaskConical, PackageX, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import PageLoader from '../components/PageLoader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import OrderItemsList from '../components/OrderItemsList.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Spinner from '../components/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';
import usePayment from '../hooks/usePayment.jsx';
import { cancelOrder, fetchOrder, fetchPaymentConfig } from '../services/orderService.js';
import { getErrorMessage } from '../services/api.js';
import { formatDate, formatPrice } from '../utils/format.js';
import { orderNumber, PAYMENT_METHOD_LABEL } from '../utils/orders.js';

function Timeline({ order }) {
  const cancelled = order.orderStatus === 'cancelled';
  const steps = [
    { label: 'Order placed', date: order.createdAt, done: true },
    { label: 'Payment confirmed', date: order.payment?.paidAt, done: order.paymentStatus === 'paid' || order.paymentStatus === 'refunded' },
    { label: 'Preparing handover', done: ['processing', 'delivered'].includes(order.orderStatus) || order.paymentStatus === 'refunded' },
    { label: 'Account delivered', date: order.deliveredAt, done: order.orderStatus === 'delivered' },
  ];
  if (cancelled) steps.push({ label: 'Cancelled', date: order.cancelledAt, done: true, cancelled: true });

  return (
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4">
          {i < steps.length - 1 && (
            <span className={`absolute left-[15px] top-8 h-[calc(100%-4px)] w-0.5 ${step.done ? 'bg-brand-600' : 'bg-slate-200'}`} />
          )}
          <span
            className={`relative z-10 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${
              step.cancelled ? 'bg-slate-500 text-white' : step.done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {step.cancelled ? <XCircle size={16} /> : <Check size={16} />}
          </span>
          <div className="pt-1">
            <p className={`text-sm font-semibold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
            {step.date && step.done && <p className="text-xs text-slate-500">{formatDate(step.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error, reload, setData } = useFetch(() => fetchOrder(id), [id]);
  const { startPayment, paymentModal } = usePayment();
  const [paying, setPaying] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="container-page py-16">
        {/not found/i.test(error) ? (
          <EmptyState
            icon={PackageX}
            title="Order not found"
            description="This order doesn't exist or belongs to another account."
            action={<Link to="/orders" className="btn-primary">My orders</Link>}
          />
        ) : (
          <ErrorState title="Couldn't load this order" message={error} onRetry={reload} />
        )}
      </div>
    );
  }

  const canPay = order.orderStatus === 'pending' && ['pending', 'failed'].includes(order.paymentStatus);
  const canCancel = ['pending', 'processing'].includes(order.orderStatus);

  const payNow = async () => {
    setPaying(true);
    try {
      let payment = { provider: 'simulated' };
      if (order.paymentMethod === 'razorpay') {
        const config = await fetchPaymentConfig();
        payment = {
          keyId: config.razorpay.keyId,
          amount: Math.round(order.totalAmount * 100),
          currency: order.currency,
          providerOrderId: order.payment.providerOrderId,
        };
      }
      const paid = await startPayment(order, payment);
      setData(paid);
      toast.success('Payment successful!');
    } catch (err) {
      if (!err.dismissed) toast.error(getErrorMessage(err, 'Payment failed. Please try again.'));
      if (err.response?.data?.order) setData(err.response.data.order);
    } finally {
      setPaying(false);
    }
  };

  const doCancel = async () => {
    setCancelling(true);
    try {
      setData(await cancelOrder(order._id));
      toast.success('Order cancelled');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel the order'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Order ${orderNumber(order._id)}`}
        subtitle={`Placed on ${formatDate(order.createdAt)}`}
        crumbs={[{ label: 'Orders', to: '/orders' }, { label: orderNumber(order._id) }]}
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={order.orderStatus} />
                <StatusBadge status={order.paymentStatus} type="payment" />
              </div>
              <div className="flex flex-wrap gap-2">
                {canPay && (
                  <button type="button" className="btn-primary" onClick={payNow} disabled={paying}>
                    {paying ? <Spinner size={16} /> : <CreditCard size={16} />} Pay {formatPrice(order.totalAmount)}
                  </button>
                )}
                {canCancel && (
                  <button type="button" className="btn-outline text-rose-600" onClick={() => setConfirmCancel(true)}>
                    Cancel order
                  </button>
                )}
              </div>
            </div>
            {canPay && (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                This order is waiting for payment. Unpaid orders are cancelled automatically after 30 minutes.
              </p>
            )}
            <div className="mt-4 border-t border-slate-100">
              <OrderItemsList items={order.items} />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-5 text-lg font-bold">Progress</h2>
            <Timeline order={order} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery</dt>
                <dd className="font-medium text-emerald-600">{order.deliveryFee ? formatPrice(order.deliveryFee) : 'FREE'}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold">{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-slate-600">
              Paid with <span className="font-medium">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</span>
            </p>
            {order.payment?.isTest && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                <FlaskConical size={14} /> TEST payment — no real money
              </p>
            )}
          </div>

          <div className="card p-6 text-sm">
            <h2 className="text-lg font-bold">Delivery details</h2>
            <p className="mt-3 font-medium text-slate-900">{order.contact.fullName}</p>
            <p className="text-slate-600">{order.contact.email}</p>
            <p className="text-slate-600">{order.contact.phone}</p>
            <p className="text-slate-600">{order.contact.country}</p>
            <p className="mt-2 text-slate-600">
              Preferred contact: <span className="font-medium capitalize">{order.contact.preferredContact}</span>
            </p>
            {order.contact.notes && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-slate-600">{order.contact.notes}</p>}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message={
          order.paymentStatus === 'paid'
            ? 'The account will go back on sale and your test payment will be marked as refunded.'
            : 'The reserved account will go back on sale.'
        }
        confirmLabel="Cancel order"
        danger
        busy={cancelling}
        onConfirm={doCancel}
        onCancel={() => setConfirmCancel(false)}
      />
      {paymentModal}
    </>
  );
}
