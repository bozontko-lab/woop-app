import type { ReactNode } from 'react';
import { cx } from './cx';

interface NoticeProps {
  tone?: 'info' | 'hint' | 'error' | 'success';
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}

const tones = {
  info: 'border-line bg-surface-2 text-fg',
  hint: 'border-hint-line bg-hint-bg text-hint-fg',
  error: 'border-danger bg-surface text-danger',
  success: 'border-ok bg-surface text-fg',
};

export function Notice({ tone = 'info', title, children, className, role }: NoticeProps) {
  return (
    <div role={role} className={cx('rounded-xl border px-4 py-3', tones[tone], className)}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cx(Boolean(title) && 'mt-1')}>{children}</div>}
    </div>
  );
}

/** Polite live region for short confirmations („Skopiowano”). */
export function LiveMessage({ message }: { message: string | null }) {
  return (
    <p role="status" aria-live="polite" className={cx('min-h-6 text-sm font-medium text-ok', !message && 'sr-only')}>
      {message ?? ''}
    </p>
  );
}
