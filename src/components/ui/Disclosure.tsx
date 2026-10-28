import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from './cx';

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Disclosure({ summary, children, className, defaultOpen }: DisclosureProps) {
  return (
    <details className={cx('group rounded-xl', className)} open={defaultOpen}>
      <summary className="flex min-h-11 list-none items-center gap-2 rounded-lg font-semibold text-primary [&::-webkit-details-marker]:hidden">
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
        <span>{summary}</span>
      </summary>
      <div className="pt-2 pb-1 pl-7 text-fg">{children}</div>
    </details>
  );
}
