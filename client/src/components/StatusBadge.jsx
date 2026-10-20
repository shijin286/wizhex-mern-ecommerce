import { ORDER_STATUS, PAYMENT_STATUS } from '../utils/orders.js';

export default function StatusBadge({ status, type = 'order' }) {
  const map = type === 'payment' ? PAYMENT_STATUS : ORDER_STATUS;
  const config = map[status] || { label: status, className: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return <span className={`badge ring-1 ring-inset ${config.className}`}>{config.label}</span>;
}
