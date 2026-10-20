import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, max, min = 1, onChange, size = 'md', disabled = false }) {
  const dims = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  const inputWidth = size === 'sm' ? 'w-10 text-sm' : 'w-12';

  const set = (next) => {
    const parsed = Number.parseInt(next, 10);
    if (Number.isNaN(parsed)) return;
    onChange(Math.max(min, Math.min(parsed, max)));
  };

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
      <button
        type="button"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        className={`${dims} grid place-items-center rounded-l-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-40`}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => set(event.target.value)}
        className={`${inputWidth} border-x border-slate-200 bg-transparent text-center font-semibold text-slate-900 focus:outline-none`}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        className={`${dims} grid place-items-center rounded-r-xl text-slate-600 transition hover:bg-slate-100 disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
