import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { cx } from '../../components/ui/cx';
import { formatDate, parseISODate } from '../../domain/dates';
import { monthGrid, type CalendarDay } from '../../domain/stats';
import type { Checkin, Practice } from '../../domain/types';

function describe(day: CalendarDay): string {
  const d = pl.stats.day;
  const parts: string[] = [];
  if (day.checkin) {
    parts.push(d.checkin);
    parts.push(day.checkin.obstacleOccurred && day.checkin.planUsed ? d.plan[day.checkin.planUsed] : d.noObstacle);
    if (day.checkin.rating) parts.push(`${day.checkin.rating}/5`);
  }
  if (day.rehearsed) parts.push(d.rehearsal);
  if (day.sos) parts.push(t(d.sos, { count: day.sos }));
  return `${formatDate(day.date, pl.locale, { day: 'numeric', month: 'long' })}: ${parts.length ? parts.join(', ') : d.nothing}`;
}

/** Month view of check-ins (dot) and rehearsals (diamond); details on tap/focus. */
export function CheckinCalendar({
  today,
  firstDate,
  checkins,
  practices,
}: {
  today: string;
  firstDate: string;
  checkins: Checkin[];
  practices: Practice[];
}) {
  const s = pl.stats;
  const now = parseISODate(today);
  const start = parseISODate(firstDate);
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const weeks = monthGrid(month.year, month.month, today, checkins, practices);
  const label = formatDate(`${month.year}-${String(month.month + 1).padStart(2, '0')}-01`, pl.locale, {
    month: 'long',
    year: 'numeric',
  });
  const shift = (delta: number) => {
    const date = new Date(month.year, month.month + delta, 1);
    setMonth({ year: date.getFullYear(), month: date.getMonth() });
    setSelected(null);
  };
  const atStart =
    month.year < start.getFullYear() || (month.year === start.getFullYear() && month.month <= start.getMonth());
  const atEnd = month.year > now.getFullYear() || (month.year === now.getFullYear() && month.month >= now.getMonth());

  return (
    <section
      aria-labelledby="calendar-title"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="calendar-title" className="font-bold">
          {s.calendarTitle}: <span className="font-normal">{label}</span>
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={atStart}
            aria-label={s.calendarPrev}
            className="grid size-11 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={atEnd}
            aria-label={s.calendarNext}
            className="grid size-11 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-1 text-center">
        <thead>
          <tr>
            {s.weekdays.map((day) => (
              <th key={day} scope="col" className="text-xs font-semibold text-muted">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]!.date}>
              {week.map((day) => (
                <td key={day.date} className="p-0">
                  {day.inMonth ? (
                    <button
                      type="button"
                      onClick={() => setSelected(day)}
                      onFocus={() => setSelected(day)}
                      aria-label={describe(day)}
                      aria-pressed={selected?.date === day.date}
                      className={cx(
                        'flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg text-sm',
                        day.isToday && 'ring-2 ring-primary',
                        selected?.date === day.date ? 'bg-surface-2' : 'hover:bg-surface-2',
                        day.isFuture ? 'text-muted' : 'text-fg',
                      )}
                    >
                      <span aria-hidden="true" className="tabular-nums">
                        {parseISODate(day.date).getDate()}
                      </span>
                      <span aria-hidden="true" className="flex h-2 items-center gap-1">
                        {day.checkin && <span className="size-2 rounded-full bg-viz-1" />}
                        {day.rehearsed && <span className="size-2 rotate-45 rounded-[1px] bg-viz-2" />}
                      </span>
                    </button>
                  ) : (
                    <span aria-hidden="true" className="block h-12" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="flex flex-wrap gap-4 text-sm text-muted" aria-label={s.legendLabel}>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-viz-1" />
          {s.legend.checkin}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rotate-45 rounded-[1px] bg-viz-2" />
          {s.legend.rehearsal}
        </li>
      </ul>
      <p className="min-h-6 text-sm font-medium" aria-live="polite">
        {selected ? describe(selected) : ''}
      </p>
    </section>
  );
}
