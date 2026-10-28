import { X } from 'lucide-react';
import { Link } from 'react-router';
import { pl } from '../../content/pl';

/** Top bar of a focused screen: a quiet label and a way out. */
export function FocusHeader({ label, closeTo }: { label: string; closeTo: string }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-3 pb-2">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <Link
        to={closeTo}
        aria-label={pl.nav.closeFocus}
        className="grid size-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
      >
        <X aria-hidden="true" className="size-6" />
      </Link>
    </div>
  );
}
