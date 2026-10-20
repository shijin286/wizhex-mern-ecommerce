// Display helpers shared by the customer and admin order pages.

export const orderNumber = (id = '') => `WZ-${String(id).slice(-8).toUpperCase()}`;

export const ORDER_STATUS = {
  pending: { label: 'Awaiting payment', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  processing: { label: 'Preparing handover', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Unpaid', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  failed: { label: 'Payment failed', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  refunded: { label: 'Refunded', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

export const PAYMENT_METHOD_LABEL = {
  simulated: 'Test payment (simulated)',
  razorpay: 'Razorpay',
};

export function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.body.appendChild(script);
  });
}
