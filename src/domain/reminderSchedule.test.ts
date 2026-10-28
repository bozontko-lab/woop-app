import { describe, expect, it } from 'vitest';
import { referenceWoop } from './__fixtures__/reference';
import { dueToday, isoWeekday, minutesOf, remindersToNotify } from './reminderSchedule';
import type { Checkin, Practice, Reminder } from './types';

const reminder = (kind: Reminder['kind'], time: string, extra: Partial<Reminder> = {}): Reminder => ({
  id: `r-${kind}`,
  woopId: 'ref-1',
  kind,
  time,
  days: [1, 2, 3, 4, 5, 6, 7],
  enabled: true,
  lastNotified: null,
  createdAt: '',
  updatedAt: '',
  ...extra,
});
// Wednesday, 28 October 2026, local time
const at = (hh: number, mm = 0) => new Date(2026, 9, 28, hh, mm);
const woops = [referenceWoop({ reviewDate: '2026-11-04' })];

describe('reminder schedule', () => {
  it('knows ISO weekdays and times', () => {
    expect(isoWeekday('2026-10-28')).toBe(3);
    expect(isoWeekday('2026-11-01')).toBe(7);
    expect(minutesOf('18:30')).toBe(1110);
  });

  it('lists the check-in after its time until it is done', () => {
    const input = {
      woops,
      reminders: [reminder('checkin', '21:00')],
      checkins: [] as Checkin[],
      practices: [] as Practice[],
    };
    expect(dueToday(input, at(20, 59))).toEqual([]);
    expect(dueToday(input, at(21, 5))).toEqual([{ kind: 'checkin', woopId: 'ref-1', reminderId: 'r-checkin' }]);
    const done = { ...input, checkins: [{ woopId: 'ref-1', date: '2026-10-28' } as Checkin] };
    expect(dueToday(done, at(21, 5))).toEqual([]);
  });

  it('shows the obstacle reminder for three hours unless „Przeszkoda teraz!” was used', () => {
    const input = { woops, reminders: [reminder('obstacle', '18:00')], checkins: [], practices: [] as Practice[] };
    expect(dueToday(input, at(18, 0))).toHaveLength(1);
    expect(dueToday(input, at(21, 1))).toHaveLength(0);
    const used = { ...input, practices: [{ woopId: 'ref-1', kind: 'sos', date: '2026-10-28' } as Practice] };
    expect(dueToday(used, at(18, 30))).toHaveLength(0);
  });

  it('respects days and the enabled switch, and adds a due review', () => {
    const weekend = reminder('checkin', '08:00', { days: [6, 7] });
    const off = reminder('obstacle', '08:00', { enabled: false });
    const review = [referenceWoop({ reviewDate: '2026-10-28' })];
    expect(dueToday({ woops: review, reminders: [weekend, off], checkins: [], practices: [] }, at(9))).toEqual([
      { kind: 'review', woopId: 'ref-1' },
    ]);
  });

  it('notifies once, within 15 minutes of the time', () => {
    const r = reminder('checkin', '21:00');
    expect(remindersToNotify([r], woops, at(21, 10))).toEqual([r]);
    expect(remindersToNotify([r], woops, at(21, 20))).toEqual([]);
    expect(remindersToNotify([{ ...r, lastNotified: '2026-10-28' }], woops, at(21, 5))).toEqual([]);
    expect(remindersToNotify([r], [referenceWoop({ status: 'achieved' })], at(21, 5))).toEqual([]);
  });
});
