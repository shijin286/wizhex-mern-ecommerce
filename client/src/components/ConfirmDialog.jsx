import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onCancel} disabled={busy}>
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={danger ? 'btn bg-rose-600 text-white hover:bg-rose-700' : 'btn-primary'}
          >
            {busy && <Spinner size={16} />} {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ${danger ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'}`}>
          <AlertTriangle size={20} />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}
