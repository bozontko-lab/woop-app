import { parseISODate, toLocalISODate } from './dates';
import type { Checkin, Practice, Reminder, Woop } from './types';

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
export const WEEKDAY_DAYS = [1, 2, 3, 4, 5];
export const WEEKEND_DAYS = [6, 7];

/** How long after its time an obstacle reminder stays on the „Na dziś” list. */
const OBSTACLE_WINDOW_MIN = 180;
/** How late a system notification may still be shown. */
const NOTIFY_WINDOW_MIN = 15;

/** 1 = Monday … 7 = Sunday */
export function isoWeekday(iso: string): number {
  return ((parseISODate(iso).getDay() + 6) % 7) + 1;
}

export function minutesOf(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
}

const nowMinutes = (now: Date) => now.getHours() * 60 + now.getMinutes();

export type DueKind = 'review' | 'checkin' | 'obstacle';

export interface DueItem {
  kind: DueKind;
  woopId: string;
  reminderId?: string;
}

interface DueInput {
  woops: readonly Woop[];
  reminders: readonly Reminder[];
  /** Today's check-ins and practices (all WOOPs). */
  checkins: readonly Checkin[];
  practices: readonly Practice[];
}

/** What deserves attention today, shown in the app („Na dziś”). */
export function dueToday({ woops, reminders, checkins, practices }: DueInput, now: Date): DueItem[] {
  const today = toLocalISODate(now);
  const weekday = isoWeekday(today);
  const minutes = nowMinutes(now);
  const active = new Map(woops.filter((w) => w.status === 'active').map((w) => [w.id, w]));
  const items: DueItem[] = [];

  for (const woop of active.values()) {
    if (woop.reviewDate && woop.reviewDate <= today) items.push({ kind: 'review', woopId: woop.id });
  }
  for (const reminder of reminders) {
    if (!reminder.enabled || !active.has(reminder.woopId) || !reminder.days.includes(weekday)) continue;
    const start = minutesOf(reminder.time);
    if (minutes < start) continue;
    if (reminder.kind === 'checkin' && !checkins.some((c) => c.woopId === reminder.woopId && c.date === today)) {
      items.push({ kind: 'checkin', woopId: reminder.woopId, reminderId: reminder.id });
    }
    if (
      reminder.kind === 'obstacle' &&
      minutes <= start + OBSTACLE_WINDOW_MIN &&
      !practices.some((p) => p.woopId === reminder.woopId && p.kind === 'sos' && p.date === today)
    ) {
      items.push({ kind: 'obstacle', woopId: reminder.woopId, reminderId: reminder.id });
    }
  }
  const order: DueKind[] = ['obstacle', 'checkin', 'review'];
  return items.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}

/** Reminders whose time has just come and that have not been shown today (system notifications). */
export function remindersToNotify(reminders: readonly Reminder[], woops: readonly Woop[], now: Date): Reminder[] {
  const today = toLocalISODate(now);
  const weekday = isoWeekday(today);
  const minutes = nowMinutes(now);
  const active = new Set(woops.filter((w) => w.status === 'active').map((w) => w.id));
  return reminders.filter((r) => {
    if (!r.enabled || !active.has(r.woopId) || !r.days.includes(weekday) || r.lastNotified === today) return false;
    const start = minutesOf(r.time);
    return minutes >= start && minutes < start + NOTIFY_WINDOW_MIN;
  });
}
