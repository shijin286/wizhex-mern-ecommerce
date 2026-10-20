import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

// Counts down to the end of the current day, so the deal always looks "live".
function getTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function DealBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section pb-0">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6 sm:p-8 md:flex-row md:items-center"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
              <Tag size={22} />
            </span>
            <div>
              <h3 className="text-xl font-extrabold sm:text-2xl">Deal of the Day: Call of Duty accounts</h3>
              <p className="mt-1 text-sm text-slate-600">Legendary ranks and Mythic weapons at special prices — today only.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2" aria-label="Time left in today's deal">
              <Clock size={18} className="text-orange-600" />
              {[
                ['hrs', timeLeft.hours],
                ['min', timeLeft.minutes],
                ['sec', timeLeft.seconds],
              ].map(([label, value]) => (
                <div key={label} className="min-w-[52px] rounded-xl bg-white px-2 py-1.5 text-center shadow-sm">
                  <p className="font-display text-lg font-extrabold tabular-nums text-slate-900">
                    {String(value).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <Link to="/shop?category=call-of-duty&sort=price_desc" className="btn-dark">
              Grab the deal
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
