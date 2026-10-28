import { pl } from '../../content/pl';
import { t } from '../../content/t';
import type { PlanUsage, WeekActivity } from '../../domain/stats';

const percent = (rate: number) => `${Math.round(rate * 100)}%`;
const decimal = new Intl.NumberFormat(pl.locale, { maximumFractionDigits: 1 });

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="text-3xl font-bold">{value}</dd>
      {detail && <dd className="text-sm text-muted">{detail}</dd>}
    </div>
  );
}

export function StatTiles({ usage, week, rating }: { usage: PlanUsage; week: WeekActivity; rating: number | null }) {
  const s = pl.stats;
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Tile
          label={s.planTile}
          value={usage.rate === null ? '–' : percent(usage.rate)}
          detail={
            usage.total
              ? `${t(s.planUsage, { used: usage.used, total: usage.total })} (${t(s.planUsageDetail, { yes: usage.yes, partly: usage.partly, no: usage.no })})`
              : s.noSituations
          }
        />
        <Tile
          label={s.weekTitle}
          value={t(s.weekCheckins, { count: week.checkinDays })}
          detail={`${t(s.weekRehearsals, { count: week.rehearsalDays })}. ${s.noStreaks}`}
        />
        {rating !== null && <Tile label={s.ratingTile} value={`${decimal.format(rating)}/5`} />}
      </dl>
    </div>
  );
}
