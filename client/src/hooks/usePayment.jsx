import { useCallback, useRef, useState } from 'react';
import SimulatedPaymentModal from '../components/SimulatedPaymentModal.jsx';
import { confirmPayment } from '../services/orderService.js';
import { loadScript, orderNumber } from '../utils/orders.js';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const dismissed = (message) => Object.assign(new Error(message), { dismissed: true });

/**
 * Runs the payment step for an order and resolves with the paid order.
 * Rejects with `error.dismissed = true` when the buyer closes the window.
 * Render `paymentModal` somewhere in the page (used for simulated payments).
 */
export default function usePayment() {
  const [pending, setPending] = useState(null); // simulated payment in progress: { order }
  const [busy, setBusy] = useState(false);
  const handlers = useRef(null);

  const startPayment = useCallback(async (order, payment) => {
    if (order.paymentMethod === 'simulated') {
      return new Promise((resolve, reject) => {
        handlers.current = { resolve, reject };
        setPending({ order });
      });
    }

    await loadScript(RAZORPAY_SCRIPT);
    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.providerOrderId,
        name: 'WIZHEX',
        description: `Order ${orderNumber(order._id)}`,
        prefill: { name: order.contact.fullName, email: order.contact.email, contact: order.contact.phone },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            resolve(await confirmPayment(order._id, response));
          } catch (error) {
            reject(error);
          }
        },
        modal: { ondismiss: () => reject(dismissed('Payment window closed')) },
      });
      checkout.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed')));
      checkout.open();
    });
  }, []);

  const finishSimulated = async (outcome) => {
    const { resolve, reject } = handlers.current;
    setBusy(true);
    try {
      const paid = await confirmPayment(pending.order._id, { outcome });
      resolve(paid);
    } catch (error) {
      reject(error);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const cancelSimulated = () => {
    handlers.current?.reject(dismissed('Payment cancelled'));
    setPending(null);
  };

  const paymentModal = (
    <SimulatedPaymentModal
      open={Boolean(pending)}
      order={pending?.order}
      busy={busy}
      onSuccess={() => finishSimulated('success')}
      onFailure={() => finishSimulated('failure')}
      onCancel={cancelSimulated}
    />
  );

  return { startPayment, paymentModal };
}
