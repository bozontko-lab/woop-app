import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { referenceWoop } from './__fixtures__/reference';
import { buildIcs, escapeIcsText, firstMatchingDate, foldLine } from './ics';
import { buildWoopCalendar } from './reminders';

const NOW = new Date('2026-10-28T09:30:00.000Z');

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

  it('builds a daily reminder with an alarm and the plan in the description', () => {
    const woop = referenceWoop({ reviewDate: '2026-11-04' });
    const ics = buildWoopCalendar(woop, { time: '18:00', days: 'daily', includeReview: true, from: '2026-10-28' }, NOW);
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics).toContain('RRULE:FREQ=DAILY;UNTIL=20261127T235959');
    expect(ics).toContain('DTSTART:20261028T180000');

    const calendar = new ICAL.Component(ICAL.parse(ics));
    const events = calendar.getAllSubcomponents('vevent');
    expect(events).toHaveLength(2);
    const reminder = new ICAL.Event(events[0]!);
    expect(reminder.summary).toBe('WOOP: 3 treningi w tygodniu');
    expect(reminder.description).toContain('Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój');
    expect(reminder.isRecurring()).toBe(true);
    const alarm = events[0]!.getFirstSubcomponent('valarm');
    expect(alarm?.getFirstPropertyValue('action')).toBe('DISPLAY');
    expect(String(alarm?.getFirstPropertyValue('trigger'))).toBe('PT0S');
    expect(ics).toContain('TRIGGER:PT0S');

    const iterator = reminder.iterator();
    const occurrences: string[] = [];
    for (let next = iterator.next(); next && occurrences.length < 40; next = iterator.next())
      occurrences.push(next.toString());
    expect(occurrences[0]).toBe('2026-10-28T18:00:00');
    expect(occurrences.at(-1)).toBe('2026-11-27T18:00:00');
    expect(occurrences).toHaveLength(31);

    const review = new ICAL.Event(events[1]!);
    expect(review.summary).toBe('Przegląd WOOP: 3 treningi w tygodniu');
    expect(review.startDate.toString()).toBe('2026-11-04T19:00:00');
  });

  it('supports weekdays only', () => {
    const ics = buildWoopCalendar(
      referenceWoop(),
      { time: '07:30', days: 'weekdays', includeReview: false, from: '2026-10-31' },
      NOW,
    );
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20261127T235959');
    expect(ics).toContain('DTSTART:20261102T073000');
    expect(ics).not.toContain('Przegląd');
  });

  it('produces a valid calendar for any event list', () => {
    const ics = buildIcs([], NOW, '-//Test//PL');
    expect(ics).toBe(
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Test//PL\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n',
    );
  });
});
