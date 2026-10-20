import { CreditCard, FlaskConical, ShieldCheck, XCircle } from 'lucide-react';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
import { formatPrice } from '../utils/format.js';
import { orderNumber } from '../utils/orders.js';

// A clearly labelled fake payment screen. No card details are ever collected.
export default function SimulatedPaymentModal({ open, order, busy, onSuccess, onFailure, onCancel }) {
  return (
    <Modal open={open} onClose={busy ? undefined : onCancel} title="Test payment" size="sm" dismissable={!busy}>
      {order && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <FlaskConical size={20} className="mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-bold">TEST MODE — no real money is charged.</span> This simulates a payment gateway
              so you can try the full checkout. No card details are collected or stored.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">Order {orderNumber(order._id)}</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-slate-900">{formatPrice(order.totalAmount)}</p>
            <p className="mt-1 text-xs text-slate-500">{order.items.length} account(s)</p>
          </div>

          <div className="grid gap-3">
            <button type="button" className="btn-primary w-full py-3" onClick={onSuccess} disabled={busy}>
              {busy ? <Spinner size={18} /> : <CreditCard size={18} />} Pay {formatPrice(order.totalAmount)} (test)
            </button>
            <button type="button" className="btn-outline w-full" onClick={onFailure} disabled={busy}>
              <XCircle size={18} className="text-rose-500" /> Simulate a failed payment
            </button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} /> The server verifies every payment before your order is confirmed.
          </p>
        </div>
      )}
    </Modal>
  );
}
