import { useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Disclosure } from '../../components/ui/Disclosure';
import { cx } from '../../components/ui/cx';
import { formatDate } from '../../domain/dates';
import type { WeekTrend } from '../../domain/stats';

const shortDate = (iso: string) => formatDate(iso, pl.locale, { day: 'numeric', month: 'short' });
const longDate = (iso: string) => formatDate(iso, pl.locale, { day: 'numeric', month: 'long' });

function readout(week: WeekTrend): string {
  const s = pl.stats;
  const { usage } = week;
  const value =
    usage.rate === null
      ? s.trendEmpty
      : t(s.trendValue, { percent: Math.round(usage.rate * 100), used: usage.used, total: usage.total });
  return `${t(s.trendWeek, { date: longDate(week.weekStart) })}: ${value}`;
}

/**
 * Plan usage per week: one series, one hue (dataviz slot 1). Columns ≤ 24 px with
 * rounded data ends; every value is also in the readout line and the table.
 */
export function TrendChart({ weeks }: { weeks: WeekTrend[] }) {
  const s = pl.stats;
  const [active, setActive] = useState(weeks.length - 1);
  const current = weeks[active] ?? weeks[weeks.length - 1]!;
  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <figcaption className="font-bold">{s.trendTitle}</figcaption>
      <div className="flex gap-2">
        <div
          aria-hidden="true"
          className="flex h-36 flex-col justify-between py-0 text-right text-xs text-muted tabular-nums"
        >
          <span className="-translate-y-1/2">100%</span>
          <span>50%</span>
          <span className="translate-y-1/2">0%</span>
        </div>
        <div className="relative h-36 flex-1">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-line" />
          <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-line" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-field" />
          <ul
            className="absolute inset-0 grid items-end"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {weeks.map((week, i) => {
              const { rate } = week.usage;
              return (
                <li key={week.weekStart} className="flex h-full">
                  <button
                    type="button"
                    aria-label={readout(week)}
                    aria-pressed={i === active}
                    onFocus={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={cx(
                      'group flex h-full w-full items-end justify-center rounded-md',
                      i === active && 'bg-surface-2',
                    )}
                  >
                    {rate !== null && (
                      <span
                        className="block w-full max-w-6 rounded-t-[4px] bg-viz-1 group-hover:opacity-90"
                        style={{ height: `${Math.max(2, rate * 100)}%` }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="flex gap-2 pl-10">
        <ul
          aria-hidden="true"
          className="grid flex-1 text-center text-xs text-muted"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week) => (
            <li key={week.weekStart}>{shortDate(week.weekStart)}</li>
          ))}
        </ul>
      </div>
      <p className="min-h-6 text-sm font-medium" aria-live="polite">
        {readout(current)}
      </p>
      <Disclosure summary={pl.stats.tableSummary}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-1 font-semibold">
                {s.tableWeek}
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                {s.tableSituations}
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                {s.tableUsed}
              </th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart} className="border-b border-line last:border-0">
                <th scope="row" className="py-1 font-normal">
                  {t(s.trendWeek, { date: longDate(week.weekStart) })}
                </th>
                <td className="py-1 text-right tabular-nums">{week.usage.total}</td>
                <td className="py-1 text-right tabular-nums">
                  {week.usage.rate === null ? '–' : `${week.usage.used} (${Math.round(week.usage.rate * 100)}%)`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Disclosure>
    </figure>
  );
}
