import { pl } from '../content/pl';
import { t } from '../content/t';
import { addDays } from './dates';
import { buildIcs, WEEKDAYS, WEEKEND, type IcsEvent } from './ics';
import { planSentence } from './summary/format';
import type { Woop } from './types';

export type ReminderDays = 'daily' | 'weekdays' | 'weekends';

export interface CalendarOptions {
  /** HH:MM */
  time: string;
  days: ReminderDays;
  includeReview: boolean;
  /** Local date from which reminders start. */
  from: string;
}

export const DEFAULT_REMINDER_TIME = '19:00';
const REVIEW_TIME = '19:00';

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

export function reminderEvents(woop: Woop, options: CalendarOptions): IcsEvent[] {
  const title = woop.wish.short || woop.wish.text;
  const until =
    woop.timeframe?.endDate && woop.timeframe.endDate >= options.from
      ? woop.timeframe.endDate
      : addDays(options.from, 30);
  const days = options.days === 'daily' ? 'daily' : options.days === 'weekdays' ? WEEKDAYS : WEEKEND;
  const events: IcsEvent[] = [
    {
      uid: `${woop.id}-reminder@woopmylife`,
      summary: t(pl.nextSteps.reminders.eventTitle, { wish: title }),
      description: cardDescription(woop),
      date: options.from,
      time: options.time,
      durationMinutes: 10,
      recurrence: { days, until },
      alarm: { minutesBefore: 0, description: planSentence(woop.plan) },
    },
  ];
  if (options.includeReview && woop.reviewDate) {
    events.push({
      uid: `${woop.id}-review-${woop.reviewDate}@woopmylife`,
      summary: t(pl.nextSteps.reminders.reviewTitle, { wish: title }),
      description: `${pl.nextSteps.reminders.reviewDescription}\n\n${cardDescription(woop)}`,
      date: woop.reviewDate,
      time: REVIEW_TIME,
      durationMinutes: 20,
      alarm: { minutesBefore: 0, description: t(pl.nextSteps.reminders.reviewTitle, { wish: title }) },
    });
  }
  return events;
}

export function buildWoopCalendar(woop: Woop, options: CalendarOptions, now: Date): string {
  return buildIcs(reminderEvents(woop, options), now, `-//${pl.app.name}//PL`);
}
