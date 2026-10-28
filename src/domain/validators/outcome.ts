import { contentWords, overlapRatio } from '../text/normalize';
import { hasAny } from '../text/patterns';
import type { Lexicon, Nudge, Outcome, Wish } from '../types';
import { isBlank } from './shared';

/** Flags an outcome that merely repeats the wish and names no felt benefit. */
export function validateOutcomeText(outcome: Outcome, wish: Wish, lexicon: Lexicon): Nudge[] {
  if (isBlank(outcome.text)) return [];
  const text = [outcome.text, ...outcome.deeper].join(' ');
  if (hasAny(text, lexicon.feeling)) return [];
  const words = contentWords(outcome.text, lexicon.stopwords);
  const overlap = overlapRatio(words, contentWords(wish.text, lexicon.stopwords));
  if (overlap >= 0.5 || words.length <= 3) {
    return [{ code: 'outcome.repeatsWish', field: 'outcome.text' }];
  }
  return [];
}
