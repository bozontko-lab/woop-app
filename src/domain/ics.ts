import { addDays, parseISODate } from './dates';

export type IcsDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
export const WEEKDAYS: IcsDay[] = ['MO', 'TU', 'WE', 'TH', 'FR'];
export const WEEKEND: IcsDay[] = ['SA', 'SU'];
const JS_DAY: IcsDay[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export interface IcsEvent {
  uid: string;
  summary: string;
  description: string;
  /** Local date (YYYY-MM-DD). */
  date: string;
  /** Local time (HH:MM). Times are "floating": they follow the device's time zone. */
  time: string;
  durationMinutes: number;
  recurrence?: { days: IcsDay[] | 'daily'; until: string };
  alarm?: { minutesBefore: number; description: string };
}

export function escapeIcsText(text: string): string {
  return text.replace(/\\/gu, '\\\\').replace(/;/gu, '\\;').replace(/,/gu, '\\,').replace(/\r?\n/gu, '\\n');
}

/** Folds a content line to at most 75 octets (UTF-8), as RFC 5545 requires. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (size + bytes > limit) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += bytes;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compactDate = (iso: string) => iso.replace(/-/gu, '');
const compactTime = (time: string) => `${time.replace(':', '')}00`;

function utcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/gu, '')
    .replace(/\.\d{3}/u, '');
}

/** First date on or after `from` that falls on one of the days. */
export function firstMatchingDate(from: string, days: IcsDay[] | 'daily'): string {
  if (days === 'daily') return from;
  for (let i = 0; i < 7; i++) {
    const candidate = addDays(from, i);
    if (days.includes(JS_DAY[parseISODate(candidate).getDay()]!)) return candidate;
  }
  return from;
}

function eventLines(event: IcsEvent, stamp: string): string[] {
  const start = event.recurrence ? firstMatchingDate(event.date, event.recurrence.days) : event.date;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${compactDate(start)}T${compactTime(event.time)}`,
    `DURATION:PT${event.durationMinutes}M`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];
  if (event.recurrence) {
    const until = `UNTIL=${compactDate(event.recurrence.until)}T235959`;
    lines.push(
      event.recurrence.days === 'daily'
        ? `RRULE:FREQ=DAILY;${until}`
        : `RRULE:FREQ=WEEKLY;BYDAY=${event.recurrence.days.join(',')};${until}`,
    );
  }
  if (event.alarm) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(event.alarm.description)}`,
      event.alarm.minutesBefore > 0 ? `TRIGGER:-PT${event.alarm.minutesBefore}M` : 'TRIGGER:PT0S',
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT');
  return lines;
}

export function buildIcs(events: IcsEvent[], now: Date, prodId: string): string {
  const stamp = utcStamp(now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.flatMap((event) => eventLines(event, stamp)),
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
