import { findFirst, hasAny } from '../text/patterns';
import { tokenize } from '../text/normalize';
import type { Lexicon, Nudge, Wish } from '../types';
import { isBlank } from './shared';

export function hasMeasure(text: string, lexicon: Lexicon): boolean {
  return /\d/u.test(text) || hasAny(text, lexicon.measure);
}

export function findVague(text: string, lexicon: Lexicon): string | null {
  if (hasMeasure(text, lexicon)) return null;
  return findFirst(text, lexicon.vague)?.text ?? null;
}

export function findDependency(text: string, lexicon: Lexicon): string | null {
  return findFirst(text, lexicon.dependent)?.text ?? null;
}

export function isNegativeGoal(text: string, lexicon: Lexicon): boolean {
  const first = tokenize(text)[0];
  if (first?.norm === 'nie') return true;
  return hasAny(text, lexicon.negation);
}

/** Checks of the wish itself: depends on others, too general, phrased as avoidance. */
export function validateWishText(wish: Wish, lexicon: Lexicon): Nudge[] {
  if (isBlank(wish.text)) return [];
  const nudges: Nudge[] = [];
  const dependency = findDependency(wish.text, lexicon);
  if (dependency) nudges.push({ code: 'wish.dependent', field: 'wish.text', match: dependency });
  const vague = findVague(wish.text, lexicon);
  if (vague) nudges.push({ code: 'wish.vague', field: 'wish.text', match: vague });
  if (isNegativeGoal(wish.text, lexicon)) nudges.push({ code: 'wish.negation', field: 'wish.text' });
  return nudges;
}

export function validateWishSuccess(wish: Wish): Nudge[] {
  return isBlank(wish.successCriterion) ? [{ code: 'wish.noCriterion', field: 'wish.successCriterion' }] : [];
}

export function validateImportance(wish: Wish): Nudge[] {
  return wish.importance !== null && wish.importance <= 4
    ? [{ code: 'wish.lowImportance', field: 'wish.importance' }]
    : [];
}

/** For the checklist: concrete (here or in the success criterion) and in the user's hands. */
export function isWishConcrete(wish: Wish, lexicon: Lexicon): boolean {
  if (isBlank(wish.text)) return false;
  if (findDependency(wish.text, lexicon)) return false;
  const vague = findVague(wish.text, lexicon);
  return !vague || hasMeasure(wish.successCriterion, lexicon);
}
