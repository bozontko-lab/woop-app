import { addDays, minDate } from './dates';
import type { ReviewDecision, StepId, Timeframe, VersionReason, Woop } from './types';

export function isReviewDue(woop: Woop, today: string): boolean {
  return woop.status === 'active' && woop.reviewDate !== null && woop.reviewDate <= today;
}

/** A week later, but not after the end of the timeframe (unless it has already passed). */
export function nextReviewDate(today: string, timeframe: Timeframe | null): string {
  const next = addDays(today, 7);
  return timeframe && timeframe.endDate > today ? minDate(next, timeframe.endDate) : next;
}

export interface EditTarget {
  step: StepId;
  reason: VersionReason;
  /** Clear obstacle and plan first (a new WOOP iteration). */
  reset?: 'obstacle';
}

/** Where a review decision leads in the wizard. New iterations start by picturing the outcome again. */
export function editTargetFor(decision: ReviewDecision): EditTarget | null {
  switch (decision) {
    case 'fixPlan':
      return { step: 'plan-builder', reason: 'fixPlan' };
    case 'newObstacle':
      return { step: 'outcome-visualize', reason: 'newObstacle', reset: 'obstacle' };
    case 'changeWish':
      return { step: 'wish-text', reason: 'changeWish' };
    default:
      return null;
  }
}
