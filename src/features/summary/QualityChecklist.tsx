import { CircleAlert, CircleCheck } from 'lucide-react';
import { pl } from '../../content/pl';
import { ButtonLink } from '../../components/ui/Button';
import { qualityChecklist } from '../../domain/summary/checklist';
import type { Woop } from '../../domain/types';

export function QualityChecklist({ woop }: { woop: Woop }) {
  const c = pl.summary.checklist;
  const items = qualityChecklist(woop, pl.lexicon);
  const allGood = items.every((item) => item.ok);
  return (
    <section aria-labelledby="checklist-title" className="flex flex-col gap-3">
      <h2 id="checklist-title" className="text-xl font-bold">
        {c.title}
      </h2>
      <p className="text-muted">{allGood ? c.allGood : c.intro}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const content = c.items[item.id];
          return (
            <li
              key={item.id}
              data-check={item.id}
              data-ok={item.ok}
              className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3"
            >
              {item.ok ? (
                <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-ok" />
              ) : (
                <CircleAlert aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-hint-line" />
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {content.label}
                  <span className="sr-only"> – {item.ok ? c.ok : c.toFix}</span>
                </p>
                {!item.ok && <p className="text-sm text-muted">{content.hint}</p>}
              </div>
              {!item.ok && (
                <ButtonLink
                  size="sm"
                  variant="secondary"
                  to={`/wizard/${woop.id}?edit=${item.fixStep}`}
                  aria-label={`${c.fix}: ${content.label}`}
                >
                  {c.fix}
                </ButtonLink>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
