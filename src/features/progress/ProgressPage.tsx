import { WoopNotFound } from '../../app/errors';
import { useTodayISO } from '../../app/time';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Loading } from '../../components/ui/Loading';
import { useTracking } from '../../data/hooks';
import { formatShortDate, toLocalISODate } from '../../domain/dates';
import { averageRating, planUsage, situations, weekActivity, weeklyTrend } from '../../domain/stats';
import { QuickActions } from '../woop/QuickActions';
import { useLoadedWoop } from '../woop/useLoadedWoop';
import { WoopTabs } from '../woop/WoopTabs';
import { CheckinCalendar } from './CheckinCalendar';
import { RecentEntries } from './RecentEntries';
import { StatTiles } from './StatTiles';
import { TrendChart } from './TrendChart';

export function ProgressPage() {
  const loaded = useLoadedWoop();
  const tracking = useTracking(loaded.state === 'ready' ? loaded.woop.id : undefined);
  const today = useTodayISO();
  const s = pl.stats;
  useDocumentTitle(s.title);

  if (loaded.state === 'loading' || tracking.status === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;
  const { checkins, practices, reviews } = tracking.value;
  const list = situations(checkins, practices);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted">{woop.wish.short || woop.wish.text}</p>
        <h1 className="text-3xl font-bold">{s.title}</h1>
      </header>
      <WoopTabs woopId={woop.id} />
      {woop.status === 'active' && <QuickActions woop={woop} />}
      <StatTiles
        usage={planUsage(list)}
        week={weekActivity(checkins, practices, today)}
        rating={averageRating(checkins)}
      />
      <TrendChart weeks={weeklyTrend(list, today, 6)} />
      <CheckinCalendar
        today={today}
        firstDate={toLocalISODate(new Date(woop.createdAt))}
        checkins={checkins}
        practices={practices}
      />
      <RecentEntries checkins={checkins} />
      {reviews.length > 0 && (
        <section aria-labelledby="reviews-title" className="flex flex-col gap-2">
          <h2 id="reviews-title" className="font-bold">
            {pl.review.past}
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {[...reviews].reverse().map((review) => (
              <li key={review.id}>
                {t(pl.review.pastItem, {
                  date: formatShortDate(review.date, pl.locale),
                  decision: pl.review.decisions[review.decision].label,
                })}
                {review.whatWorked && <span className="block text-muted">{review.whatWorked}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
