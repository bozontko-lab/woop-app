import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Disclosure } from '../../components/ui/Disclosure';
import { formatLongDate, toLocalISODate } from '../../domain/dates';
import { planSentence } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';

/** Earlier versions of the WOOP – every change made after a review is kept here. */
export function VersionHistory({ woop }: { woop: Woop }) {
  const v = pl.versions;
  if (woop.history.length === 0) return null;
  return (
    <Disclosure summary={`${v.title} (${woop.history.length + 1})`}>
      <ol className="flex flex-col gap-4">
        <li className="font-semibold">{t(v.current, { version: woop.version })}</li>
        {[...woop.history].reverse().map((snapshot) => (
          <li key={snapshot.version} className="flex flex-col gap-1 border-l-2 border-line pl-3">
            <p className="font-semibold">
              {t(v.item, {
                version: snapshot.version,
                date: formatLongDate(toLocalISODate(new Date(snapshot.savedAt)), pl.locale),
                reason: v.reasons[snapshot.reason] ?? snapshot.reason,
              })}
            </p>
            <p className="text-sm">
              <span className="text-muted">{pl.summary.labels.wish}:</span>{' '}
              {snapshot.core.wish.short || snapshot.core.wish.text}
            </p>
            <p className="text-sm">
              <span className="text-muted">{pl.summary.labels.obstacle}:</span>{' '}
              {snapshot.core.obstacle.short || snapshot.core.obstacle.text}
            </p>
            <p className="text-sm">
              <span className="text-muted">{pl.summary.labels.plan}:</span> {planSentence(snapshot.core.plan)}
            </p>
          </li>
        ))}
      </ol>
    </Disclosure>
  );
}
