import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  FlaskConical,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import useFetch from '../hooks/useFetch.js';
import usePayment from '../hooks/usePayment.jsx';
import { createOrder, fetchPaymentConfig } from '../services/orderService.js';
import { getErrorMessage } from '../services/api.js';
import { DELIVERY_PROMISE, PLACEHOLDER_IMAGE } from '../utils/constants.js';
import { formatPrice, handleImageError } from '../utils/format.js';
import { newIdempotencyKey, orderNumber } from '../utils/orders.js';
import { EMAIL_PATTERN } from '../utils/validation.js';

const STEPS = ['Delivery details', 'Review order', 'Payment', 'Confirmation'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Saudi Arabia', 'Canada', 'Australia', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Germany'];

function Stepper({ step }) {
  return (
    <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Checkout progress">
      {STEPS.map((label, index) => {
        const done = index < step;
        const active = index === step;
        return (
          <li key={label} className="flex flex-col items-center gap-2 text-center" aria-current={active ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <div className={`h-0.5 flex-1 ${index === 0 ? 'invisible' : done || active ? 'bg-brand-600' : 'bg-slate-200'}`} />
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                  done ? 'bg-brand-600 text-white' : active ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check size={16} /> : index + 1}
              </span>
              <div className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? 'invisible' : done ? 'bg-brand-600' : 'bg-slate-200'}`} />
            </div>
            <span className={`text-xs font-medium sm:text-sm ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error && <p className="field-error">{error.message}</p>}
    </div>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, itemCount, subtotal, mrpTotal, savings, total, clearCart, syncing } = useCart();
  const navigate = useNavigate();
  const { startPayment, paymentModal } = usePayment();
  const { data: payConfig, loading: configLoading } = useFetch(fetchPaymentConfig, []);

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('simulated');
  const [placing, setPlacing] = useState(false);
  const [created, setCreated] = useState(null); // { order, payment } once the order exists
  const idempotencyKey = useRef(newIdempotencyKey());
  const finished = useRef(false);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: defaultAddress?.phone || '',
      country: defaultAddress?.country || 'India',
      preferredContact: 'whatsapp',
      notes: '',
    },
  });

  // Pick an available payment method once the config arrives.
  useEffect(() => {
    if (!payConfig) return;
    if (!payConfig.simulated.enabled && payConfig.razorpay.enabled) setPaymentMethod('razorpay');
  }, [payConfig]);

  if (!syncing && items.length === 0 && !created && !finished.current) {
    return <Navigate to="/cart" replace />;
  }

  const onContact = (values) => {
    setContact({ ...values, fullName: values.fullName.trim(), email: values.email.trim(), notes: values.notes.trim() });
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeAndPay = async () => {
    setPlacing(true);
    try {
      // Create the order once; retries reuse it (and the idempotency key protects against double submits).
      let current = created;
      if (!current) {
        current = await createOrder({ items, contact, paymentMethod, idempotencyKey: idempotencyKey.current });
        setCreated(current);
      }
      const paid = await startPayment(current.order, current.payment);
      finished.current = true;
      clearCart();
      setStep(3);
      toast.success('Payment successful!');
      navigate(`/order-success/${paid._id}`, { replace: true });
    } catch (error) {
      if (error.dismissed) {
        toast('Payment not completed. Your accounts are reserved for 30 minutes.');
      } else {
        toast.error(getErrorMessage(error, 'Payment failed. Please try again.'));
      }
    } finally {
      setPlacing(false);
    }
  };

  const methods = [
    payConfig?.simulated.enabled && {
      id: 'simulated',
      title: 'Test payment (simulated)',
      text: 'Try the full checkout without real money. Clearly marked as TEST.',
      icon: FlaskConical,
      badge: 'TEST MODE',
    },
    payConfig?.razorpay.enabled && {
      id: 'razorpay',
      title: 'Card / UPI / Netbanking via Razorpay',
      text: 'Secure Razorpay checkout. Uses Razorpay test keys in development.',
      icon: CreditCard,
      badge: 'Razorpay',
    },
  ].filter(Boolean);

  return (
    <>
      <PageHeader title="Checkout" crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <div className="container-page grid gap-8 py-8 lg:grid-cols-3 lg:py-10">
        <div className="lg:col-span-2">
          <Stepper step={step} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit(onContact)}
                noValidate
                className="card space-y-5 p-6 sm:p-8"
              >
                <div>
                  <h2 className="text-xl font-bold">Where should we send your account?</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Accounts are delivered digitally. We use these details to hand over the login and help you secure it.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
                    <input
                      id="fullName"
                      autoComplete="name"
                      className={`input ${errors.fullName ? 'input-error' : ''}`}
                      {...register('fullName', {
                        required: 'Please enter your full name',
                        validate: (v) => v.trim().length >= 2 || 'Please enter your full name',
                      })}
                    />
                  </Field>
                  <Field label="Email" htmlFor="email" error={errors.email}>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
                      })}
                    />
                  </Field>
                  <Field label="Phone / WhatsApp number" htmlFor="phone" error={errors.phone}>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className={`input ${errors.phone ? 'input-error' : ''}`}
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^\+?[0-9\s-]{7,20}$/, message: 'Enter a valid phone number' },
                      })}
                    />
                  </Field>
                  <Field label="Country" htmlFor="country" error={errors.country}>
                    <input
                      id="country"
                      list="country-list"
                      autoComplete="country-name"
                      className={`input ${errors.country ? 'input-error' : ''}`}
                      {...register('country', {
                        required: 'Country is required',
                        validate: (v) => v.trim().length >= 2 || 'Country is required',
                      })}
                    />
                    <datalist id="country-list">
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                </div>

                <fieldset>
                  <legend className="label">Preferred contact for the handover</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { value: 'email', label: 'Email', icon: Mail },
                    ].map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
                      >
                        <input type="radio" value={value} className="accent-brand-600" {...register('preferredContact')} />
                        <Icon size={18} className="text-brand-600" />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field label="Notes (optional)" htmlFor="notes" error={errors.notes}>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Best time to reach you, game username, etc."
                    className="input resize-none"
                    {...register('notes', { maxLength: { value: 500, message: 'Notes must be under 500 characters' } })}
                  />
                </Field>

                <div className="flex justify-between gap-3">
                  <Link to="/cart" className="btn-ghost">
                    <ArrowLeft size={16} /> Back to cart
                  </Link>
                  <button type="submit" className="btn-primary">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card space-y-6 p-6 sm:p-8"
              >
                <h2 className="text-xl font-bold">Review your order</h2>
                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-4 p-4">
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt=""
                        onError={handleImageError}
                        className="h-16 w-20 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">Delivery details</p>
                  <p className="mt-1 text-slate-600">
                    {contact.fullName} · {contact.email} · {contact.phone} · {contact.country}
                  </p>
                  <p className="mt-1 text-slate-600">
                    Contact via <span className="font-medium capitalize">{contact.preferredContact}</span>
                  </p>
                  <button type="button" onClick={() => setStep(0)} className="mt-2 text-sm font-semibold text-brand-600 hover:underline">
                    Edit details
                  </button>
                </div>

                <div className="flex justify-between gap-3">
                  <button type="button" className="btn-ghost" onClick={() => setStep(0)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                    Continue to payment <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card space-y-6 p-6 sm:p-8"
              >
                <h2 className="text-xl font-bold">Choose a payment method</h2>

                {configLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Spinner size={16} /> Loading payment options…
                  </div>
                ) : methods.length === 0 ? (
                  <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                    Payments are not available right now. Please contact support.
                  </p>
                ) : (
                  <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
                    {methods.map(({ id, title, text, icon: Icon, badge }) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                          paymentMethod === id ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-600/20' : 'border-slate-200 hover:border-slate-300'
                        } ${created ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={id}
                          checked={paymentMethod === id}
                          disabled={Boolean(created)}
                          onChange={() => setPaymentMethod(id)}
                          className="mt-1 accent-brand-600"
                        />
                        <Icon size={22} className="mt-0.5 flex-shrink-0 text-brand-600" />
                        <div className="flex-1">
                          <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                            {title}
                            <span className="badge bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-800">{badge}</span>
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">{text}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {created && (
                  <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                    Order <span className="font-semibold">{orderNumber(created.order._id)}</span> is reserved for you. Complete
                    the payment to confirm it.
                  </p>
                )}

                <div className="flex flex-wrap justify-between gap-3">
                  <button type="button" className="btn-ghost" onClick={() => setStep(1)} disabled={placing || Boolean(created)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary px-6 py-3"
                    onClick={placeAndPay}
                    disabled={placing || methods.length === 0}
                  >
                    {placing ? <Spinner size={18} /> : <Lock size={16} />}
                    {created ? 'Complete payment' : `Place order & pay ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside>
          <div className="card p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Price ({itemCount} items)</dt>
                <dd className="font-medium text-slate-900">{formatPrice(mrpTotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate-600">Discount</dt>
                  <dd className="font-medium text-emerald-600">−{formatPrice(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery</dt>
                <dd className="font-medium text-emerald-600">FREE</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-extrabold text-slate-900">{formatPrice(created ? created.order.totalAmount : total)}</dd>
              </div>
            </dl>
            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex gap-2">
                <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                Prices and availability are confirmed by our server when you place the order.
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                {DELIVERY_PROMISE}. 7-day account guarantee.
              </li>
            </ul>
          </div>
        </aside>
      </div>
      {paymentModal}
    </>
  );
}
