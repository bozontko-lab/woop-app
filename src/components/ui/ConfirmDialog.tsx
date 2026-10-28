import { useEffect, useRef } from 'react';
import { pl } from '../../content/pl';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native modal <dialog>: focus trap, Escape and inert background for free. Focus lands on „Anuluj” (first button). */
export function ConfirmDialog({ open, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-5 text-fg shadow-xl backdrop:bg-black/50"
    >
      <p className="text-lg">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {pl.common.cancel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
