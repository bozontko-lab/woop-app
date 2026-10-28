import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { PHASE_STYLES } from '../../components/ui/PhaseProgress';
import { cx } from '../../components/ui/cx';
import { buildCardData } from '../../domain/card/data';
import { createdDate, describeTimeframe } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';

export function WoopCard({ woop }: { woop: Woop }) {
  const data = buildCardData(woop);
  const meta = pl.summary.meta;
  return (
    <article
      aria-label={pl.summary.cardLabel}
      className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm"
    >
      <ul>
        {data.sections.map((section) => (
          <li key={section.phase} className="flex gap-4 border-b border-line px-5 py-4">
            <span
              aria-hidden="true"
              className={cx(
                'grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold',
                PHASE_STYLES[section.phase].badge,
              )}
            >
              {section.letter}
            </span>
            <div className="min-w-0">
              <h2 className={cx('text-sm font-semibold tracking-wide uppercase', PHASE_STYLES[section.phase].text)}>
                {section.label}
              </h2>
              <p className="text-xl font-semibold break-words">{section.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-surface-2 px-5 py-4">
        <p className="text-sm font-semibold text-plan">{pl.summary.full.plan}</p>
        <p className="mt-1 text-lg" data-testid="card-plan">
          {data.planSentence}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-3 px-5 py-4 text-sm">
        <div className="col-span-3">
          <dt className="text-muted">{meta.timeframe}</dt>
          <dd className="font-semibold">{describeTimeframe(woop.timeframe)}</dd>
        </div>
        <div>
          <dt className="text-muted">{meta.created}</dt>
          <dd className="font-semibold">{createdDate(woop)}</dd>
        </div>
        {woop.wish.importance !== null && (
          <div>
            <dt className="text-muted">{meta.importance}</dt>
            <dd className="font-semibold">{t(pl.common.scale, { value: woop.wish.importance })}</dd>
          </div>
        )}
        {woop.realism !== null && (
          <div>
            <dt className="text-muted">{meta.realism}</dt>
            <dd className="font-semibold">{t(pl.common.scale, { value: woop.realism })}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
