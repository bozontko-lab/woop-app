import type { ReactNode } from 'react';

/** Earlier answers shown as a quiet reminder above the question. */
export function AnswerContext({ items }: { items: { label: string; value: string }[] }) {
  const visible = items.filter((item) => item.value.trim());
  if (visible.length === 0) return null;
  return (
    <dl className="flex flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      {visible.map((item) => (
        <div key={item.label}>
          <dt className="text-sm font-semibold text-muted">{item.label}</dt>
          <dd className="text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Quote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="rounded-xl border-l-4 border-outcome bg-surface px-4 py-3">
      <figcaption className="text-sm font-semibold text-muted">{label}</figcaption>
      <blockquote className="mt-1 text-lg">{children}</blockquote>
    </figure>
  );
}
