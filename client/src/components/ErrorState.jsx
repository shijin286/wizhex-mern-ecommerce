import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-12 text-center"
    >
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle size={24} />
      </span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-5">
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  );
}
