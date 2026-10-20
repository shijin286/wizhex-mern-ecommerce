import Spinner from './Spinner.jsx';

export default function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-brand-600">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
