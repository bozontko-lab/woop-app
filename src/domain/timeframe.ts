import { addDays, addMonths, diffDays, isISODate, minDate } from './dates';
import type { Timeframe, TimeframeType } from './types';

/** Rolling windows, see docs/DECISIONS.md (7). */
export function computeTimeframe(type: TimeframeType, today: string, customEnd?: string): Timeframe {
  switch (type) {
    case 'today':
      return { type, startDate: today, endDate: today };
    case 'week':
      return { type, startDate: today, endDate: addDays(today, 6) };
    case 'month':
      return { type, startDate: today, endDate: addDays(addMonths(today, 1), -1) };
    case 'date':
      return { type, startDate: today, endDate: customEnd ?? '' };
  }
}

export function isTimeframeValid(timeframe: Timeframe | null): timeframe is Timeframe {
  if (!timeframe) return false;
  if (!isISODate(timeframe.startDate) || !isISODate(timeframe.endDate)) return false;
  return timeframe.endDate >= timeframe.startDate;
}

/** First review: end of short timeframes, otherwise after a week. */
export function defaultReviewDate(timeframe: Timeframe): string {
  if (diffDays(timeframe.startDate, timeframe.endDate) <= 7) return timeframe.endDate;
  return minDate(timeframe.endDate, addDays(timeframe.startDate, 7));
}
