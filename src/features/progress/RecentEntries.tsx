import { pl } from '../../content/pl';
import { formatShortDate } from '../../domain/dates';
import type { Checkin } from '../../domain/types';

/** The table view of the progress data: latest check-ins with notes. */
export function RecentEntries({ checkins, limit = 14 }: { checkins: Checkin[]; limit?: number }) {
  const s = pl.stats;
  const rows = [...checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-3">
      <h2 id="recent-title" className="font-bold">
        {s.recentTitle}
      </h2>
      {rows.length === 0 ? (
        <p className="text-muted">{s.recentEmpty}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                {s.recentDate}
              </th>
              <th scope="col" className="py-1.5 pr-2 font-semibold">
                {s.recentResult}
              </th>
              <th scope="col" className="py-1.5 text-right font-semibold">
                {s.recentRating}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line align-top last:border-0">
                <th scope="row" className="py-1.5 pr-2 font-normal whitespace-nowrap">
                  {formatShortDate(row.date, pl.locale)}
                </th>
                <td className="py-1.5 pr-2">
                  {row.obstacleOccurred && row.planUsed ? s.day.plan[row.planUsed] : s.day.noObstacle}
                  {row.note && <span className="mt-0.5 block text-muted">{row.note}</span>}
                </td>
                <td className="py-1.5 text-right tabular-nums">{row.rating ? `${row.rating}/5` : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
