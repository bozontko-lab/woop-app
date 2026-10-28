import { buildIfPrefill, cleanIfPart, parseIfThen } from '../plan';
import { contentWords, normalize, overlapRatio, tokenize, type Token } from '../text/normalize';
import { findFirst, findMatches } from '../text/patterns';
import type { FieldPath, Lexicon, Nudge, Obstacle, Plan, Wish } from '../types';
import { isBlank } from './shared';

const POLISH_LETTERS = /[ąćęłńóśźż]/iu;

function verbTokens(text: string, lexicon: Lexicon): { token: Token; index: number }[] {
  const stop = new Set(lexicon.verbStoplist.map((w) => w.toLowerCase()));
  const withDiacritics = POLISH_LETTERS.test(text);
  return tokenize(text)
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => {
      const w = token.lower;
      if (w.length < 3 || stop.has(w)) return false;
      if (w.endsWith('ę')) return true;
      if (w.length >= 4 && (w.endsWith('am') || w.endsWith('em'))) return true;
      // Typed without Polish letters: „zrobie”, „zaloze”.
      return !withDiacritics && w.length >= 4 && w.endsWith('e');
    });
}

/** Heuristic: is there a verb in the 1st person singular („założę”, „przeczytam”, „zjem”)? */
export function hasFirstPersonVerb(text: string, lexicon: Lexicon): boolean {
  return verbTokens(text, lexicon).length > 0;
}

export function hasInfinitive(text: string): boolean {
  const withDiacritics = POLISH_LETTERS.test(text);
  return tokenize(text).some(({ lower }) =>
    withDiacritics
      ? lower.length >= 3 && lower.endsWith('ć')
      : lower.length >= 4 && /(ac|ic|ec|yc|uc|sc)$/u.test(lower),
  );
}

/** All verbs negated („nie sięgnę po telefon”) – a plan of avoidance rather than action. */
function isOnlyNegative(text: string, lexicon: Lexicon): boolean {
  const tokens = tokenize(text);
  if (tokens[0]?.norm !== 'nie') return false;
  const verbs = verbTokens(text, lexicon);
  return verbs.every(({ index }) => tokens[index - 1]?.norm === 'nie');
}

/** Checks of an action part („to …”), shared by the plan and the backup plan. */
export function validateAction(text: string, field: FieldPath, lexicon: Lexicon): Nudge[] {
  if (isBlank(text)) return [];
  const weak = findFirst(text, lexicon.weakPlan);
  if (weak) return [{ code: 'plan.weakThen', field, match: weak.text }];
  if (isOnlyNegative(text, lexicon)) return [{ code: 'plan.negativeThen', field }];
  if (!hasFirstPersonVerb(text, lexicon)) {
    return [{ code: hasInfinitive(text) ? 'plan.infinitive' : 'plan.noAction', field }];
  }
  return [];
}

function wishLikeMatch(text: string, lexicon: Lexicon): boolean {
  const normalized = normalize(text);
  return findMatches(text, lexicon.wishLike).some((m) => {
    const after = normalize(text.slice(m.end));
    const before = normalize(text.slice(0, m.start));
    // „nie chce mi się” is an obstacle, not a wish.
    return !after.startsWith('mi ') && after !== 'mi' && !before.endsWith('nie') && normalized.length > 0;
  });
}

/** The „jeśli” part describes the wish instead of the obstacle/situation. */
export function isIfPartWishLike(plan: Plan, wish: Wish, obstacle: Obstacle, lexicon: Lexicon): boolean {
  const ifText = cleanIfPart(plan.ifText, lexicon);
  if (!ifText) return false;
  if (wishLikeMatch(ifText, lexicon)) return true;
  const ifWords = contentWords(ifText, lexicon.stopwords);
  const wishWords = contentWords(`${wish.text} ${wish.short}`, lexicon.stopwords);
  const obstacleWords = contentWords(
    [obstacle.text, obstacle.short, obstacle.when, obstacle.where].join(' '),
    lexicon.stopwords,
  );
  return overlapRatio(ifWords, wishWords) >= 0.5 && overlapRatio(ifWords, obstacleWords) < 0.3;
}

export function validatePlan(plan: Plan, wish: Wish, obstacle: Obstacle, lexicon: Lexicon): Nudge[] {
  const nudges: Nudge[] = [];
  const whole = parseIfThen(plan.thenText, lexicon);
  if (whole) {
    nudges.push({ code: 'plan.notIfThen', field: 'plan.thenText', options: [whole.ifText, whole.thenText] });
    return nudges;
  }
  if (isIfPartWishLike(plan, wish, obstacle, lexicon)) {
    const suggestion = buildIfPrefill(obstacle);
    nudges.push({ code: 'plan.ifIsWish', field: 'plan.ifText', ...(suggestion ? { suggestion } : {}) });
  }
  nudges.push(...validateAction(plan.thenText, 'plan.thenText', lexicon));
  return nudges;
}

/** For free text such as „Postaram się więcej ćwiczyć”: is it a proper if–then plan? */
export function validatePlanSentence(sentence: string, lexicon: Lexicon): Nudge[] {
  if (isBlank(sentence)) return [];
  const parsed = parseIfThen(sentence, lexicon);
  if (!parsed) {
    const weak = findFirst(sentence, lexicon.weakPlan);
    return [
      { code: 'plan.notIfThen', field: 'plan.thenText' },
      ...(weak ? [{ code: 'plan.weakThen' as const, field: 'plan.thenText' as const, match: weak.text }] : []),
    ];
  }
  return validateAction(parsed.thenText, 'plan.thenText', lexicon);
}
