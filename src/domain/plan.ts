import { t } from '../content/t';
import { lowerFirst, trimPunctuation } from './shortVersion';
import { normalize } from './text/normalize';
import { startsWithAny } from './text/patterns';
import type { Lexicon, Obstacle, Plan } from './types';

/** „Jeśli kiedy wracam…” → „wracam…”; removes trailing „, to”. */
export function cleanIfPart(text: string, lexicon: Lexicon): string {
  let result = text.trim();
  const start = startsWithAny(result, lexicon.conditionalStart);
  if (start) result = result.slice(start.end).trim();
  result = result.replace(/[\s,]+to\s*$/iu, '');
  return trimPunctuation(result);
}

/** „to od razu założę…” → „od razu założę…”. */
export function cleanThenPart(text: string): string {
  return trimPunctuation(text.trim().replace(/^to\s+/iu, ''));
}

export function formatPlanSentence(
  plan: Pick<Plan, 'ifText' | 'thenText'>,
  template: string,
  lexicon: Lexicon,
  empty = '…',
): string {
  const ifPart = cleanIfPart(plan.ifText, lexicon) || empty;
  const thenPart = cleanThenPart(plan.thenText) || empty;
  // No „….” while the „to” part is still empty.
  return t(template, { if: ifPart, then: thenPart }).replace(/…\.$/u, '…');
}

/** Indexes of characters that are outside of quotation marks. */
function outsideQuotes(text: string): boolean[] {
  const result: boolean[] = [];
  let depth = 0;
  for (const char of text) {
    if (char === '„' || char === '“' || char === '«') depth++;
    else if ((char === '”' || char === '»') && depth > 0) depth--;
    else if (char === '"') depth = depth > 0 ? depth - 1 : depth + 1;
    result.push(depth === 0);
    if (char.length > 1) result.push(depth === 0);
  }
  return result;
}

/**
 * Splits a free-text plan „Jeśli X, to Y” into its parts.
 * Returns null when the sentence is not in if–then form.
 */
export function parseIfThen(text: string, lexicon: Lexicon): { ifText: string; thenText: string } | null {
  const trimmed = text.trim();
  const start = startsWithAny(trimmed, lexicon.conditionalStart);
  if (!start) return null;
  const outside = outsideQuotes(trimmed);
  const candidates = [/,\s*to\s+/giu, /\s+to\s+/giu];
  for (const pattern of candidates) {
    for (const match of trimmed.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index <= start.end || !outside[index]) continue;
      const ifText = cleanIfPart(trimmed.slice(0, index), lexicon);
      const thenText = cleanThenPart(trimmed.slice(index + match[0].length));
      if (ifText && thenText) return { ifText, thenText };
    }
  }
  return null;
}

/**
 * Proposes the „jeśli” part from the obstacle and its context (when/where):
 * „po pracy czuję zmęczenie…” + „w domu” → „po pracy w domu czuję zmęczenie…”.
 */
export function buildIfPrefill(obstacle: Obstacle): string {
  let text = lowerFirst(trimPunctuation(obstacle.text));
  if (!text) return '';
  const when = trimPunctuation(obstacle.when);
  const where = trimPunctuation(obstacle.where);
  const usable = (part: string) => part.length > 0 && part.split(/\s+/u).length <= 4;
  const contains = (part: string) => normalize(text).includes(normalize(part));
  const prefix: string[] = [];
  if (usable(where) && !contains(where)) {
    const whenAt = when ? text.toLocaleLowerCase('pl-PL').indexOf(when.toLocaleLowerCase('pl-PL')) : -1;
    if (whenAt >= 0) {
      const end = whenAt + when.length;
      text = `${text.slice(0, end)} ${where}${text.slice(end)}`;
    } else {
      prefix.push(where);
    }
  }
  if (usable(when) && !contains(when)) prefix.unshift(when);
  return [...prefix, text].join(' ');
}
