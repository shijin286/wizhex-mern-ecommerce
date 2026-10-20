import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from './Spinner.jsx';
import { subscribeNewsletter } from '../services/miscService.js';
import { getErrorMessage } from '../services/api.js';
import { EMAIL_PATTERN } from '../utils/validation.js';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const message = await subscribeNewsletter(trimmed);
      toast.success(message || 'Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Subscription failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 px-6 py-12 text-white sm:px-12 sm:py-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-violet-400/20 blur-2xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <Mail size={24} />
            </span>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Get 10% off your first order</h2>
            <p className="mt-3 text-brand-100">
              Join our newsletter for early access to sales, new arrivals and members-only offers. No spam, ever.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="w-full flex-1 rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button type="submit" disabled={submitting} className="btn bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
                {submitting ? <Spinner size={16} /> : <Send size={16} />}
                Subscribe
              </button>
            </form>
            {error && (
              <p id="newsletter-error" className="mt-2 text-sm font-medium text-rose-200">
                {error}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
