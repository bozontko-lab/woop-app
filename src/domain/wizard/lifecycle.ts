import { defaultReviewDate } from '../timeframe';
import { suggestObstacleShort, suggestPlanShort, suggestShort } from '../shortVersion';
import type { Lexicon, Woop } from '../types';

/** Fills short versions that were never written (e.g. in the quick mode). */
export function withShortVersions(woop: Woop, lexicon: Lexicon): Woop {
  return {
    ...woop,
    wish: { ...woop.wish, short: woop.wish.short.trim() || suggestShort(woop.wish.text, lexicon) },
    outcome: { ...woop.outcome, short: woop.outcome.short.trim() || suggestShort(woop.outcome.text, lexicon) },
    obstacle: { ...woop.obstacle, short: woop.obstacle.short.trim() || suggestObstacleShort(woop.obstacle, lexicon) },
    plan: { ...woop.plan, short: woop.plan.short.trim() || suggestPlanShort(woop.plan, woop.obstacle, lexicon) },
  };
}

/** The wizard is done: the WOOP becomes active. */
export function activateWoop(woop: Woop, now: string, lexicon: Lexicon): Woop {
  const completed = withShortVersions(woop, lexicon);
  return {
    ...completed,
    status: 'active',
    activatedAt: woop.activatedAt ?? now,
    reviewDate: woop.reviewDate ?? (woop.timeframe ? defaultReviewDate(woop.timeframe) : null),
    wizard: null,
  };
}

/** Conscious letting go after the realism check (principle 7). */
export function releaseWoop(woop: Woop, reflection: string, now: string): Woop {
  return {
    ...woop,
    status: 'released',
    closing: { outcome: 'released', reflection: reflection.trim(), closedAt: now },
    wizard: null,
  };
}
