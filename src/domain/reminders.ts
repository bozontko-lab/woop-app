import { pl } from '../content/pl';
import { t } from '../content/t';
import { addDays, todayISO } from './dates';
import { buildIcs, type IcsDay, type IcsEvent } from './ics';
import { ALL_DAYS, isoWeekday } from './reminderSchedule';
import { planSentence } from './summary/format';
import type { Reminder, ReminderKind, Woop } from './types';

export const DEFAULT_REMINDER_TIME: Record<ReminderKind, string> = {
  obstacle: '19:00',
  checkin: '21:00',
  review: '19:00',
};

const ICS_DAYS: IcsDay[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** Sensible first set: at the obstacle's usual time, an evening check-in, a weekly review. */
export function defaultReminders(woop: Woop, now: Date, newId: () => string): Reminder[] {
  const stamp = now.toISOString();
  const base = { woopId: woop.id, lastNotified: null, createdAt: stamp, updatedAt: stamp };
  return [
    {
      ...base,
      id: newId(),
      kind: 'obstacle',
      time: woop.obstacle.time || DEFAULT_REMINDER_TIME.obstacle,
      days: ALL_DAYS,
      enabled: true,
    },
    { ...base, id: newId(), kind: 'checkin', time: DEFAULT_REMINDER_TIME.checkin, days: ALL_DAYS, enabled: true },
    {
      ...base,
      id: newId(),
      kind: 'review',
      time: DEFAULT_REMINDER_TIME.review,
      days: [isoWeekday(woop.reviewDate ?? todayISO(now))],
      enabled: true,
    },
  ];
}

function cardDescription(woop: Woop): string {
  const s = pl.summary.labels;
  return [
    planSentence(woop.plan),
    '',
    `${s.wish}: ${woop.wish.short || woop.wish.text}`,
    `${s.outcome}: ${woop.outcome.short || woop.outcome.text}`,
    `${s.obstacle}: ${woop.obstacle.short || woop.obstacle.text}`,
  ].join('\n');
}

function toEvent(woop: Woop, reminder: Reminder, from: string, until: string): IcsEvent {
  const r = pl.nextSteps.reminders;
  const wish = woop.wish.short || woop.wish.text;
  const days: IcsDay[] | 'daily' =
    reminder.days.length === 7 ? 'daily' : [...reminder.days].sort().map((d) => ICS_DAYS[d - 1]!);
  const base = {
    uid: `${reminder.id}@woopmylife`,
    time: reminder.time,
    durationMinutes: 10,
    recurrence: { days, until },
  };
  switch (reminder.kind) {
    case 'obstacle':
      return {
        ...base,
        date: from,
        summary: t(r.eventTitle, { wish }),
        description: cardDescription(woop),
        alarm: { minutesBefore: 0, description: planSentence(woop.plan) },
      };
    case 'checkin':
      return {
        ...base,
        date: from,
        summary: t(r.checkinTitle, { wish }),
        description: `${r.checkinDescription}\n\n${cardDescription(woop)}`,
        alarm: { minutesBefore: 0, description: t(r.checkinTitle, { wish }) },
      };
    case 'review':
      return {
        ...base,
        durationMinutes: 20,
        date: woop.reviewDate && woop.reviewDate > from ? woop.reviewDate : from,
        summary: t(r.reviewTitle, { wish }),
        description: `${r.reviewDescription}\n\n${cardDescription(woop)}`,
        alarm: { minutesBefore: 0, description: t(r.reviewTitle, { wish }) },
      };
  }
}

/** Recurring calendar events for the enabled reminders, until the end of the timeframe. */
export function reminderEvents(woop: Woop, reminders: readonly Reminder[], from: string): IcsEvent[] {
  const end = woop.timeframe?.endDate;
  const until = end && end >= from ? end : addDays(from, 30);
  return reminders.filter((r) => r.enabled && r.woopId === woop.id).map((r) => toEvent(woop, r, from, until));
}

export function buildWoopCalendar(woop: Woop, reminders: readonly Reminder[], from: string, now: Date): string {
  return buildIcs(reminderEvents(woop, reminders, from), now, `-//${pl.app.name}//PL`);
}
