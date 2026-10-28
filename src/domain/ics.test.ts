import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { referenceWoop } from './__fixtures__/reference';
import { buildIcs, escapeIcsText, firstMatchingDate, foldLine } from './ics';
import { buildWoopCalendar, defaultReminders } from './reminders';
import type { Reminder } from './types';

const NOW = new Date('2026-10-28T09:30:00.000Z');

function remindersFor(overrides: Partial<Record<Reminder['kind'], Partial<Reminder>>> = {}) {
  let id = 0;
  const woop = referenceWoop({ reviewDate: '2026-11-04' });
  return {
    woop,
    reminders: defaultReminders(woop, NOW, () => `r${++id}`).map((r) => ({ ...r, ...overrides[r.kind] })),
  };
}

describe('ics', () => {
  it('escapes text values', () => {
    expect(escapeIcsText('Jeśli X, to Y; potem\nZ \\ koniec')).toBe('Jeśli X\\, to Y\\; potem\\nZ \\\\ koniec');
  });

  it('folds lines to 75 octets without splitting Polish characters', () => {
    const line = `DESCRIPTION:${'żółć '.repeat(40)}`;
    const folded = foldLine(line).split('\r\n');
    const encoder = new TextEncoder();
    expect(folded.length).toBeGreaterThan(1);
    for (const part of folded) expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.map((p, i) => (i === 0 ? p : p.slice(1))).join('')).toBe(line);
  });

  it('starts a weekly rule on a matching day', () => {
    expect(firstMatchingDate('2026-10-31', ['MO', 'TU', 'WE', 'TH', 'FR'])).toBe('2026-11-02');
    expect(firstMatchingDate('2026-10-28', 'daily')).toBe('2026-10-28');
  });

  it('proposes default reminders from the WOOP', () => {
    const { reminders } = remindersFor();
    expect(reminders.map((r) => [r.kind, r.time, r.days.length])).toEqual([
      ['obstacle', '18:00', 7],
      ['checkin', '21:00', 7],
      ['review', '19:00', 1],
    ]);
    expect(reminders[2]!.days).toEqual([3]); // 2026-11-04 is a Wednesday
  });

  it('turns reminders into recurring events with alarms (parsed by ical.js)', () => {
    const { woop, reminders } = remindersFor();
    const ics = buildWoopCalendar(woop, reminders, '2026-10-28', NOW);
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20261127T235959');
    expect(ics).toContain('DTSTART:20261028T180000');
    expect(ics).toContain('TRIGGER:PT0S');

    const events = new ICAL.Component(ICAL.parse(ics)).getAllSubcomponents('vevent');
    expect(events).toHaveLength(3);
    const [obstacle, checkin, review] = events.map((e) => new ICAL.Event(e));
    expect(obstacle!.summary).toBe('WOOP: 3 treningi w tygodniu');
    expect(obstacle!.description).toContain('Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój');
    expect(events[0]!.getFirstSubcomponent('valarm')?.getFirstPropertyValue('action')).toBe('DISPLAY');

    const iterator = obstacle!.iterator();
    const occurrences: string[] = [];
    for (let next = iterator.next(); next && occurrences.length < 40; next = iterator.next()) {
      occurrences.push(next.toString());
    }
    expect(occurrences[0]).toBe('2026-10-28T18:00:00');
    expect(occurrences.at(-1)).toBe('2026-11-27T18:00:00');
    expect(occurrences).toHaveLength(31);

    expect(checkin!.summary).toBe('Check-in WOOP: 3 treningi w tygodniu');
    expect(checkin!.startDate.toString()).toBe('2026-10-28T21:00:00');
    expect(review!.summary).toBe('Przegląd WOOP: 3 treningi w tygodniu');
    expect(review!.startDate.toString()).toBe('2026-11-04T19:00:00');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20261127T235959');
  });

  it('supports weekdays only and skips disabled reminders', () => {
    const { woop, reminders } = remindersFor({
      obstacle: { time: '07:30', days: [1, 2, 3, 4, 5] },
      checkin: { enabled: false },
      review: { enabled: false },
    });
    const ics = buildWoopCalendar(woop, reminders, '2026-10-31', NOW);
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20261127T235959');
    expect(ics).toContain('DTSTART:20261102T073000');
    expect(ics).not.toContain('Check-in');
    expect(ics).not.toContain('Przegląd');
  });

  it('produces a valid calendar for any event list', () => {
    const ics = buildIcs([], NOW, '-//Test//PL');
    expect(ics).toBe(
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Test//PL\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n',
    );
  });
});
