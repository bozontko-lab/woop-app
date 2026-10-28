import { describe, expect, it } from 'vitest';
import { addMonths, diffDays, isISODate, toLocalISODate } from './dates';
import { computeTimeframe, defaultReviewDate, isTimeframeValid } from './timeframe';

describe('dates', () => {
  it('uses the local calendar date', () => {
    expect(toLocalISODate(new Date(2026, 9, 28, 23, 59))).toBe('2026-10-28');
  });

  it('validates and computes dates', () => {
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('2026-11-03')).toBe(true);
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(diffDays('2026-10-28', '2026-11-03')).toBe(6);
  });
});

describe('timeframe', () => {
  const today = '2026-10-28';

  it('computes rolling windows', () => {
    expect(computeTimeframe('today', today)).toEqual({ type: 'today', startDate: today, endDate: today });
    expect(computeTimeframe('week', today).endDate).toBe('2026-11-03');
    expect(computeTimeframe('month', today).endDate).toBe('2026-11-27');
    expect(computeTimeframe('date', today, '2026-12-24').endDate).toBe('2026-12-24');
  });

  it('rejects missing or past end dates', () => {
    expect(isTimeframeValid(null)).toBe(false);
    expect(isTimeframeValid(computeTimeframe('date', today))).toBe(false);
    expect(isTimeframeValid(computeTimeframe('date', today, '2026-10-01'))).toBe(false);
    expect(isTimeframeValid(computeTimeframe('week', today))).toBe(true);
  });

  it('proposes the first review', () => {
    expect(defaultReviewDate(computeTimeframe('week', today))).toBe('2026-11-03');
    expect(defaultReviewDate(computeTimeframe('month', today))).toBe('2026-11-04');
    expect(defaultReviewDate(computeTimeframe('today', today))).toBe(today);
  });
});
