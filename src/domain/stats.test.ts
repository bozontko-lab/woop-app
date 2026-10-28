import { describe, expect, it } from 'vitest';
import { averageRating, monthGrid, planUsage, situations, weekActivity, weeklyTrend, weekStart } from './stats';
import type { Checkin, PlanUse, Practice } from './types';

const checkin = (
  date: string,
  obstacleOccurred: boolean,
  planUsed: PlanUse | null,
  rating: number | null = 4,
): Checkin => ({
  id: `c-${date}`,
  woopId: 'w',
  date,
  obstacleOccurred,
  planUsed,
  rating,
  note: '',
  createdAt: `${date}T20:00:00.000Z`,
  updatedAt: `${date}T20:00:00.000Z`,
});
const practice = (date: string, kind: Practice['kind'], planUsed: PlanUse | null = null): Practice => ({
  id: `p-${date}-${kind}-${planUsed}`,
  woopId: 'w',
  kind,
  at: `${date}T18:00:00.000Z`,
  date,
  planUsed,
  updatedAt: `${date}T18:00:00.000Z`,
});

describe('stats', () => {
  it('counts every „Przeszkoda teraz!” and check-ins only on days without one', () => {
    const list = situations(
      [checkin('2026-10-26', true, 'no'), checkin('2026-10-27', true, 'yes'), checkin('2026-10-28', false, null)],
      [
        practice('2026-10-27', 'sos', 'yes'),
        practice('2026-10-27', 'sos', 'partly'),
        practice('2026-10-27', 'rehearsal'),
      ],
    );
    expect(list.map((s) => `${s.date}:${s.planUsed}:${s.source}`)).toEqual([
      '2026-10-26:no:checkin',
      '2026-10-27:yes:sos',
      '2026-10-27:partly:sos',
    ]);
    expect(planUsage(list)).toEqual({ total: 3, yes: 1, partly: 1, no: 1, used: 2, rate: 2 / 3 });
    expect(planUsage([]).rate).toBeNull();
  });

  it('groups plan usage by calendar week (Monday–Sunday)', () => {
    expect(weekStart('2026-10-28')).toBe('2026-10-26');
    expect(weekStart('2026-11-01')).toBe('2026-10-26');
    const list = situations([checkin('2026-10-20', true, 'yes'), checkin('2026-10-27', true, 'no')], []);
    const trend = weeklyTrend(list, '2026-10-28', 3);
    expect(trend.map((w) => [w.weekStart, w.usage.total, w.usage.used])).toEqual([
      ['2026-10-12', 0, 0],
      ['2026-10-19', 1, 1],
      ['2026-10-26', 1, 0],
    ]);
  });

  it('reports the week without streaks: days with activity out of 7', () => {
    const activity = weekActivity(
      [checkin('2026-10-26', false, null), checkin('2026-10-28', true, 'yes'), checkin('2026-10-25', true, 'yes')],
      [practice('2026-10-27', 'rehearsal'), practice('2026-10-27', 'rehearsal'), practice('2026-10-28', 'sos', 'yes')],
      '2026-10-28',
    );
    expect(activity).toEqual({ checkinDays: 2, rehearsalDays: 1, days: 7 });
  });

  it('builds a month grid starting on Monday', () => {
    const october = monthGrid(
      2026,
      9,
      '2026-10-28',
      [checkin('2026-10-28', true, 'yes')],
      [practice('2026-10-27', 'rehearsal')],
    );
    expect(october[0]![0]!.date).toBe('2026-09-28');
    expect(october[0]![3]).toMatchObject({ date: '2026-10-01', inMonth: true });
    expect(october.flat().find((d) => d.date === '2026-10-28')).toMatchObject({
      isToday: true,
      checkin: { planUsed: 'yes' },
    });
    expect(october.flat().find((d) => d.date === '2026-10-27')?.rehearsed).toBe(true);
    expect(october.flat().find((d) => d.date === '2026-10-29')?.isFuture).toBe(true);
    expect(october.at(-1)!.at(-1)!.date).toBe('2026-11-01');
  });

  it('averages ratings', () => {
    expect(averageRating([checkin('2026-10-26', false, null, 3), checkin('2026-10-27', false, null, 5)])).toBe(4);
    expect(averageRating([checkin('2026-10-26', false, null, null)])).toBeNull();
  });
});
