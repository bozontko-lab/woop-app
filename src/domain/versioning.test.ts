import { describe, expect, it } from 'vitest';
import { referenceWoop } from './__fixtures__/reference';
import { editTargetFor, isReviewDue, nextReviewDate } from './review';
import { coreEquals, resetForNewObstacle, startNewVersion } from './versioning';

describe('versions', () => {
  it('compares content regardless of key order', () => {
    const woop = referenceWoop();
    const reordered = {
      ...woop,
      wish: {
        importance: 8,
        successCriterion: woop.wish.successCriterion,
        short: woop.wish.short,
        text: woop.wish.text,
      },
    };
    expect(coreEquals(woop, reordered)).toBe(true);
    expect(coreEquals(woop, { ...woop, realism: 3 })).toBe(false);
  });

  it('keeps the previous content in the history', () => {
    const woop = referenceWoop();
    const changed = startNewVersion(
      { ...woop, plan: { ...woop.plan, thenText: 'nowy plan' } },
      woop,
      'fixPlan',
      '2026-11-04T19:00:00.000Z',
    );
    expect(changed.version).toBe(2);
    expect(changed.history).toEqual([
      {
        version: 1,
        savedAt: '2026-11-04T19:00:00.000Z',
        reason: 'fixPlan',
        core: expect.objectContaining({ plan: woop.plan }),
      },
    ]);
    expect(changed.plan.thenText).toBe('nowy plan');
  });

  it('starts a new iteration with the same wish and outcome', () => {
    const fresh = resetForNewObstacle(referenceWoop());
    expect(fresh.wish).toEqual(referenceWoop().wish);
    expect(fresh.outcome).toEqual(referenceWoop().outcome);
    expect(fresh.obstacle.text).toBe('');
    expect(fresh.plan.thenText).toBe('');
    expect(fresh.realism).toBeNull();
  });
});

describe('weekly review', () => {
  it('is due on the review date', () => {
    expect(isReviewDue(referenceWoop({ reviewDate: '2026-11-04' }), '2026-11-03')).toBe(false);
    expect(isReviewDue(referenceWoop({ reviewDate: '2026-11-04' }), '2026-11-04')).toBe(true);
    expect(isReviewDue(referenceWoop({ reviewDate: '2026-11-04', status: 'released' }), '2026-11-05')).toBe(false);
  });

  it('schedules the next review a week later, within the timeframe', () => {
    const timeframe = referenceWoop().timeframe;
    expect(nextReviewDate('2026-11-04', timeframe)).toBe('2026-11-11');
    expect(nextReviewDate('2026-11-25', timeframe)).toBe('2026-11-27');
    expect(nextReviewDate('2026-12-01', timeframe)).toBe('2026-12-08');
  });

  it('maps decisions to wizard steps; a new obstacle starts by picturing the outcome again', () => {
    expect(editTargetFor('fixPlan')).toEqual({ step: 'plan-builder', reason: 'fixPlan' });
    expect(editTargetFor('newObstacle')).toEqual({
      step: 'outcome-visualize',
      reason: 'newObstacle',
      reset: 'obstacle',
    });
    expect(editTargetFor('changeWish')).toEqual({ step: 'wish-text', reason: 'changeWish' });
    expect(editTargetFor('keep')).toBeNull();
    expect(editTargetFor('finish')).toBeNull();
  });
});
