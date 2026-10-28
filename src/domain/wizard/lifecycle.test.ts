import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import { referenceWoop } from '../__fixtures__/reference';
import { activateWoop, releaseWoop } from './lifecycle';

describe('lifecycle', () => {
  it('activates a WOOP, fills missing short versions and the review date', () => {
    const draft = referenceWoop({
      status: 'draft',
      wizard: { stepId: 'plan-rehearse', dismissed: [] },
      reviewDate: null,
    });
    const woop = activateWoop({ ...draft, plan: { ...draft.plan, short: '' } }, '2026-10-28T10:00:00.000Z', pl.lexicon);
    expect(woop).toMatchObject({
      status: 'active',
      wizard: null,
      activatedAt: '2026-10-28T10:00:00.000Z',
      reviewDate: '2026-11-04',
    });
    expect(woop.plan.short).toBe('„Zrobię to jutro” → założę strój');
  });

  it('releases a WOOP consciously, with a reflection', () => {
    const woop = releaseWoop(referenceWoop(), '  Teraz ważniejszy jest sen.  ', '2026-10-28T10:00:00.000Z');
    expect(woop.status).toBe('released');
    expect(woop.closing).toEqual({
      outcome: 'released',
      reflection: 'Teraz ważniejszy jest sen.',
      closedAt: '2026-10-28T10:00:00.000Z',
    });
  });
});
