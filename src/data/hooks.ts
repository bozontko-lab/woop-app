import { useLiveQuery } from 'dexie-react-hooks';
import type { Checkin, Practice, Reminder, Review, Woop, WoopStatus } from '../domain/types';
import {
  checkinRepository,
  DEFAULT_SETTINGS,
  practiceRepository,
  reminderRepository,
  reviewRepository,
  settingsRepository,
  woopRepository,
  type Settings,
} from './index';

export type Loadable<T> = { status: 'loading' } | { status: 'ready'; value: T };

const loadable = <T>(value: T | undefined): Loadable<T> =>
  value === undefined ? { status: 'loading' } : { status: 'ready', value };

/** Live WOOP by id; `value` is undefined when it does not exist. */
export function useWoop(id: string | undefined): Loadable<Woop | undefined> {
  const result = useLiveQuery(async () => ({ woop: id ? await woopRepository.get(id) : undefined }), [id]);
  return result ? { status: 'ready', value: result.woop } : { status: 'loading' };
}

export function useWoops(statuses?: readonly WoopStatus[]): Loadable<Woop[]> {
  const key = statuses?.join(',') ?? '';
  return loadable(useLiveQuery(() => woopRepository.list(statuses), [key]));
}

export function useSettings(): Settings {
  return useLiveQuery(() => settingsRepository.get(), []) ?? DEFAULT_SETTINGS;
}

/** Everything needed for a WOOP's progress: check-ins, practices, reviews and reminders. */
export function useTracking(woopId: string | undefined): Loadable<{
  checkins: Checkin[];
  practices: Practice[];
  reviews: Review[];
  reminders: Reminder[];
}> {
  return loadable(
    useLiveQuery(async () => {
      if (!woopId) return { checkins: [], practices: [], reviews: [], reminders: [] };
      const [checkins, practices, reviews, reminders] = await Promise.all([
        checkinRepository.listForWoop(woopId),
        practiceRepository.listForWoop(woopId),
        reviewRepository.listForWoop(woopId),
        reminderRepository.listForWoop(woopId),
      ]);
      return { checkins, practices, reviews, reminders };
    }, [woopId]),
  );
}

/** Today's activity across all WOOPs plus all reminders (home screen). */
export function useToday(
  date: string,
): Loadable<{ checkins: Checkin[]; practices: Practice[]; reminders: Reminder[] }> {
  return loadable(
    useLiveQuery(async () => {
      const [checkins, practices, reminders] = await Promise.all([
        checkinRepository.listForDate(date),
        practiceRepository.listForDate(date),
        reminderRepository.listAll(),
      ]);
      return { checkins, practices, reminders };
    }, [date]),
  );
}
