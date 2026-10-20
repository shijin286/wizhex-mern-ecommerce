import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FlaskConical, KeyRound, MessageCircle, ShieldCheck } from 'lucide-react';
import ErrorState from '../components/ErrorState.jsx';
import OrderItemsList from '../components/OrderItemsList.jsx';
import PageLoader from '../components/PageLoader.jsx';
import useFetch from '../hooks/useFetch.js';
import { fetchOrder } from '../services/orderService.js';
import { formatDate, formatPrice } from '../utils/format.js';
import { orderNumber, PAYMENT_METHOD_LABEL } from '../utils/orders.js';

const NEXT_STEPS = [
  { icon: MessageCircle, title: 'We contact you', text: 'Our team reaches out on your preferred channel within a few hours.' },
  { icon: KeyRound, title: 'Account handover', text: 'You receive the login and we help link it to your own email or ID.' },
  { icon: ShieldCheck, title: '7-day guarantee', text: "If anything doesn't match the listing, you get a full refund." },
];

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => fetchOrder(id), [id]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Couldn't load your order" message={error} onRetry={reload} />
      </div>
    );
  }

  const paid = order.paymentStatus === 'paid';

  return (
    <div className="container-page max-w-3xl py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
          className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${paid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}
        >
          <CheckCircle2 size={44} />
        </motion.span>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">{paid ? 'Order confirmed!' : 'Order placed'}</h1>
        <p className="mt-3 text-slate-600">
          Thanks, {order.contact.fullName.split(' ')[0]}! Your order number is{' '}
          <span className="font-bold text-slate-900">{orderNumber(order._id)}</span>.
        </p>
        {order.payment?.isTest && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
            <FlaskConical size={16} /> Test payment — no real money was charged
          </p>
        )}
      </motion.div>

      <div className="card mt-10 p-6 sm:p-8">
        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-slate-500">Date</p>
            <p className="font-semibold text-slate-900">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment</p>
            <p className="font-semibold text-slate-900">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
          </div>
          <div>
            <p className="text-slate-500">Total paid</p>
            <p className="font-semibold text-slate-900">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-100">
          <OrderItemsList items={order.items} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-5">
            <Icon size={22} className="text-brand-600" />
            <p className="mt-3 font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to={`/orders/${order._id}`} className="btn-primary">
          View order details
        </Link>
        <Link to="/shop" className="btn-outline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
