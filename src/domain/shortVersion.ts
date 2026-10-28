import { findMatches, startsWithAny } from './text/patterns';
import { countWords, normalize } from './text/normalize';
import type { Lexicon, Obstacle, Plan } from './types';

const TRAILING_PUNCTUATION = /[\s.,;:!?…–-]+$/u;
const QUOTE = /[„"“«]([^„"“”«»]+)[”"“»]/u;

/** Upper-cases the first letter, skipping leading quotes („zrobię…” → „Zrobię…”). */
export function capitalize(text: string): string {
  const index = text.search(/[\p{L}\p{N}]/u);
  if (index < 0 || !/\p{L}/u.test(text.charAt(index))) return text;
  return text.slice(0, index) + text.charAt(index).toLocaleUpperCase('pl-PL') + text.slice(index + 1);
}

export function lowerFirst(text: string): string {
  // Keep acronyms ("SMS") and proper nouns typed in capitals.
  if (
    text.length > 1 &&
    text.charAt(1) === text.charAt(1).toLocaleUpperCase('pl-PL') &&
    /\p{L}/u.test(text.charAt(1))
  ) {
    return text;
  }
  return text.charAt(0).toLocaleLowerCase('pl-PL') + text.slice(1);
}

export function trimPunctuation(text: string): string {
  return text.trim().replace(TRAILING_PUNCTUATION, '').trim();
}

/** First quoted fragment, e.g. „zrobię to jutro”. */
export function extractQuote(text: string): string | null {
  return QUOTE.exec(text)?.[1]?.trim() || null;
}

function firstSentence(text: string): string {
  const parts = text.split(/(?<=[.!?…])\s+|\n+/u).map((s) => s.trim());
  return parts.find((s) => s.length > 0) ?? '';
}

/** Removes leading filler phrases such as „Chcę”, „Moim celem jest”. */
export function stripLeadingFillers(text: string, fillers: readonly string[]): string {
  let result = text.trim();
  for (let i = 0; i < 3; i++) {
    const match = startsWithAny(result, fillers);
    if (!match) break;
    const rest = result.slice(match.end).replace(/^[\s,:–-]+/u, '');
    if (!rest) break;
    result = rest;
  }
  return result;
}

function isFunctionWord(word: string, lexicon: Lexicon): boolean {
  const norm = normalize(word);
  return lexicon.functionWords.some((fw) => normalize(fw) === norm);
}

function cutAtPhraseBoundary(text: string, maxWords: number, lexicon: Lexicon): string {
  const words = text.split(/\s+/u).filter(Boolean);
  if (words.length <= maxWords) return text;
  let cut = maxWords;
  for (let k = maxWords; k >= 2; k--) {
    if (isFunctionWord(words[k] ?? '', lexicon)) {
      cut = k;
      break;
    }
  }
  const kept = words.slice(0, cut);
  while (kept.length > 1 && isFunctionWord(kept[kept.length - 1]!, lexicon)) kept.pop();
  return trimPunctuation(kept.join(' '));
}

/**
 * Proposes a 3–6 word version of an answer for the card.
 * Prefers whole comma-separated phrases, then cuts before a preposition or conjunction.
 */
export function suggestShort(text: string, lexicon: Lexicon, maxWords = 6): string {
  let base = trimPunctuation(stripLeadingFillers(firstSentence(text), lexicon.fillerStart));
  if (!base) return '';
  if (countWords(base) > maxWords) {
    const segments = base.split(/\s*[,;]\s*/u).filter(Boolean);
    if (segments.length > 1 && countWords(segments[0]!) <= maxWords) {
      const kept: string[] = [];
      for (const segment of segments) {
        if (countWords([...kept, segment].join(' ')) > maxWords) break;
        kept.push(segment);
      }
      base = kept.join(', ');
    } else {
      base = cutAtPhraseBoundary(segments[0] ?? base, maxWords, lexicon);
    }
  }
  return capitalize(trimPunctuation(base));
}

function isFirstPersonVerb(word: string): boolean {
  const w = word.toLowerCase();
  return w.endsWith('ę') || w.endsWith('ę,');
}

/** „Zmęczenie i „zrobię to jutro”” – an emotion noun plus the inner voice, when both are present. */
export function suggestObstacleShort(obstacle: Obstacle, lexicon: Lexicon): string {
  const quote = extractQuote(obstacle.text);
  if (quote) {
    const emotion = findMatches(obstacle.text, lexicon.internal.emotion).find((m) => !isFirstPersonVerb(m.text));
    if (emotion && countWords(emotion.text) <= 2) return `${capitalize(emotion.text.toLowerCase())} i „${quote}”`;
    const when = trimPunctuation(obstacle.when);
    return when ? `${capitalize(when)}: „${quote}”` : `„${quote}”`;
  }
  return suggestShort(obstacle.text, lexicon);
}

const LEADING_ADVERBS = /^(od razu|natychmiast|wtedy|najpierw|po prostu)\s+/iu;

/** „„zrobię to jutro” → założę strój” */
export function suggestPlanShort(plan: Plan, obstacle: Obstacle, lexicon: Lexicon): string {
  const quote = extractQuote(plan.ifText) ?? extractQuote(obstacle.text);
  const trigger = quote
    ? `„${quote}”`
    : obstacle.short && countWords(obstacle.short) <= 3
      ? lowerFirst(trimPunctuation(obstacle.short))
      : lowerFirst(suggestShort(plan.ifText, lexicon, 3));
  const action = lowerFirst(suggestShort(trimPunctuation(plan.thenText).replace(LEADING_ADVERBS, ''), lexicon, 4));
  if (!trigger) return capitalize(action);
  if (!action) return capitalize(trigger);
  return `${capitalize(trigger)} → ${action}`;
}
