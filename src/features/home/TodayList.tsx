import { Bell } from 'lucide-react';
import { pl } from '../../content/pl';
import { ButtonLink } from '../../components/ui/Button';
import { dueToday, type DueKind } from '../../domain/reminderSchedule';
import type { Checkin, Practice, Reminder, Woop } from '../../domain/types';

const TARGET: Record<DueKind, string> = { review: 'review', checkin: 'checkin', obstacle: 'sos' };

interface TodayListProps {
  woops: Woop[];
  /** Today's activity, loaded together with the WOOPs so the list does not push the page down later. */
  today: { checkins: Checkin[]; practices: Practice[]; reminders: Reminder[] };
  now: Date;
}

/** „Na dziś”: due reviews, check-ins and the obstacle's usual time – the in-app side of reminders. */
export function TodayList({ woops, today, now }: TodayListProps) {
  const d = pl.dashboard;
  const items = dueToday({ woops, ...today }, now);
  if (items.length === 0) return null;
  const byId = new Map(woops.map((w) => [w.id, w]));
  return (
    <section aria-labelledby="today-title" className="flex flex-col gap-3">
      <h2 id="today-title" className="text-xl font-bold">
        {d.today}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const woop = byId.get(item.woopId)!;
          return (
            <li
              key={`${item.kind}-${item.woopId}`}
              className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-hint-line bg-hint-bg px-4 py-3 text-hint-fg"
              data-due={item.kind}
            >
              <Bell aria-hidden="true" className="size-5 shrink-0" />
              <div className="min-w-0 flex-1 basis-40">
                <p className="font-semibold">{d.due[item.kind]}</p>
                <p className="truncate text-sm">{woop.wish.short || woop.wish.text}</p>
              </div>
              <ButtonLink to={`/woop/${woop.id}/${TARGET[item.kind]}`} size="sm" variant="secondary">
                {d.dueActions[item.kind]}
              </ButtonLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
