import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useTodayISO } from '../../app/time';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { ButtonLink } from '../../components/ui/Button';
import { useTracking } from '../../data/hooks';
import { formatLongDate } from '../../domain/dates';
import { planUsage, situations, weekActivity } from '../../domain/stats';
import { planSentence } from '../../domain/summary/format';
import type { Woop } from '../../domain/types';
import { firstIncompleteStepId } from '../../domain/wizard/engine';
import { QuickActions } from '../woop/QuickActions';

export function ActiveWoopCard({ woop }: { woop: Woop }) {
  const d = pl.dashboard;
  const today = useTodayISO();
  const tracking = useTracking(woop.id);
  const incomplete = firstIncompleteStepId(woop.mode, woop);
  const stats =
    tracking.status === 'ready'
      ? (() => {
          const usage = planUsage(situations(tracking.value.checkins, tracking.value.practices));
          const week = weekActivity(tracking.value.checkins, tracking.value.practices, today);
          return [
            t(d.weekStats, { count: week.checkinDays }),
            usage.total ? t(d.planStats, { used: usage.used, total: usage.total }) : null,
          ]
            .filter(Boolean)
            .join(' · ');
        })()
      : '';
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm" data-woop={woop.id}>
      <Link to={`/woop/${woop.id}`} className="group flex items-start gap-3 rounded-lg">
        <div className="min-w-0 flex-1">
          {woop.timeframe && (
            <p className="text-sm text-muted">
              {t(pl.home.until, { date: formatLongDate(woop.timeframe.endDate, pl.locale) })}
            </p>
          )}
          <h3 className="text-xl font-bold group-hover:underline">{woop.wish.short || woop.wish.text}</h3>
          <p className="mt-1 text-muted">{woop.plan.short || planSentence(woop.plan)}</p>
        </div>
        <ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-muted" />
        <span className="sr-only">{d.card}</span>
      </Link>
      {incomplete ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-hint-bg px-4 py-3 text-hint-fg">
          <p className="flex-1 basis-40 font-medium">{d.incomplete}</p>
          <ButtonLink to={`/wizard/${woop.id}?edit=${incomplete}`} size="sm" variant="secondary">
            {d.incompleteAction}
          </ButtonLink>
        </div>
      ) : (
        <QuickActions woop={woop} />
      )}
      {/* The line keeps its height while the stats load, so the page does not jump. */}
      <p className="min-h-5 text-sm text-muted">{stats}</p>
    </li>
  );
}
