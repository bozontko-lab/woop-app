import { addDays, parseISODate, toLocalISODate } from './dates';
import type { Checkin, PlanUse, Practice } from './types';

/** A moment when the obstacle showed up and how the plan went. */
export interface Situation {
  date: string;
  planUsed: PlanUse;
  source: 'sos' | 'checkin';
}

/**
 * Every „Przeszkoda teraz!” is a situation. A daily check-in counts as one
 * only on days without such a log, because it summarises the same day.
 */
export function situations(checkins: readonly Checkin[], practices: readonly Practice[]): Situation[] {
  const sos: Situation[] = practices
    .filter((p) => p.kind === 'sos' && p.planUsed !== null)
    .map((p) => ({ date: p.date, planUsed: p.planUsed!, source: 'sos' }));
  const sosDays = new Set(sos.map((s) => s.date));
  const fromCheckins: Situation[] = checkins
    .filter((c) => c.obstacleOccurred && c.planUsed !== null && !sosDays.has(c.date))
    .map((c) => ({ date: c.date, planUsed: c.planUsed!, source: 'checkin' }));
  return [...sos, ...fromCheckins].sort((a, b) => a.date.localeCompare(b.date));
}

export interface PlanUsage {
  total: number;
  yes: number;
  partly: number;
  no: number;
  /** yes + partly */
  used: number;
  /** used / total, or null without any situation. */
  rate: number | null;
}

export function planUsage(list: readonly Situation[]): PlanUsage {
  const count = (value: PlanUse) => list.filter((s) => s.planUsed === value).length;
  const yes = count('yes');
  const partly = count('partly');
  const total = list.length;
  return { total, yes, partly, no: count('no'), used: yes + partly, rate: total ? (yes + partly) / total : null };
}

/** Monday of the week containing the date. */
export function weekStart(iso: string): string {
  const offset = (parseISODate(iso).getDay() + 6) % 7;
  return addDays(iso, -offset);
}

export interface WeekTrend {
  weekStart: string;
  usage: PlanUsage;
}

/** Plan usage per calendar week, oldest first, ending with the current week. */
export function weeklyTrend(list: readonly Situation[], today: string, weeks = 6): WeekTrend[] {
  const current = weekStart(today);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(current, -7 * (weeks - 1 - i));
    const end = addDays(start, 6);
    return { weekStart: start, usage: planUsage(list.filter((s) => s.date >= start && s.date <= end)) };
  });
}

export interface WeekActivity {
  checkinDays: number;
  rehearsalDays: number;
  days: number;
}

/** „5 z 7 dni w tym tygodniu” – a break never resets anything. */
export function weekActivity(
  checkins: readonly Checkin[],
  practices: readonly Practice[],
  today: string,
): WeekActivity {
  const start = weekStart(today);
  const end = addDays(start, 6);
  const inWeek = (date: string) => date >= start && date <= end;
  return {
    checkinDays: new Set(checkins.filter((c) => inWeek(c.date)).map((c) => c.date)).size,
    rehearsalDays: new Set(practices.filter((p) => p.kind === 'rehearsal' && inWeek(p.date)).map((p) => p.date)).size,
    days: 7,
  };
}

export interface CalendarDay {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  checkin: Checkin | null;
  rehearsed: boolean;
  sos: number;
}

/** Month grid, weeks from Monday to Sunday. */
export function monthGrid(
  year: number,
  month: number,
  today: string,
  checkins: readonly Checkin[],
  practices: readonly Practice[],
): CalendarDay[][] {
  const byDate = new Map(checkins.map((c) => [c.date, c]));
  const first = toLocalISODate(new Date(year, month, 1));
  const weeks: CalendarDay[][] = [];
  let cursor = weekStart(first);
  do {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = cursor;
      week.push({
        date,
        inMonth: parseISODate(date).getMonth() === month,
        isToday: date === today,
        isFuture: date > today,
        checkin: byDate.get(date) ?? null,
        rehearsed: practices.some((p) => p.kind === 'rehearsal' && p.date === date),
        sos: practices.filter((p) => p.kind === 'sos' && p.date === date).length,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  } while (parseISODate(cursor).getMonth() === month);
  return weeks;
}

export function averageRating(checkins: readonly Checkin[]): number | null {
  const ratings = checkins.map((c) => c.rating).filter((r): r is number => r !== null);
  return ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;
}
