import { countWords } from '../text/normalize';
import { findFirst, findMatches, hasAny, startsWithAny } from '../text/patterns';
import { trimPunctuation } from '../shortVersion';
import type { InnerObstacleType, Lexicon, Nudge, Obstacle } from '../types';
import { internalMarkers, isBlank } from './shared';

const EXPLICIT_LIST = /\n|;|•|(?:^|\s)\d+[.)]\s+/u;

function cleanSegment(segment: string): string {
  return trimPunctuation(segment.replace(/^[\s\-–*•]+/u, ''));
}

/** Splits „brak czasu, zmęczenie i telefon” into separate obstacles; returns one item if it is a single one. */
export function splitObstacles(text: string, lexicon: Lexicon): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const explicit = trimmed.split(EXPLICIT_LIST).map(cleanSegment).filter(Boolean);
  if (explicit.length >= 2) return explicit;

  const conjunctions = lexicon.listConjunctions.map((c) => c.replace(/\s+/gu, '\\s+')).join('|');
  const parts = trimmed
    .split(new RegExp(`\\s*,\\s*|\\s+(?:${conjunctions})\\s+`, 'iu'))
    .map(cleanSegment)
    .filter(Boolean);
  const looksLikeList =
    parts.length >= 2 && parts.every((part) => countWords(part) <= 3 && !startsWithAny(part, lexicon.subordinators));
  return looksLikeList ? parts : [trimPunctuation(trimmed)];
}

export function isInternal(text: string, lexicon: Lexicon): boolean {
  return hasAny(text, internalMarkers(lexicon));
}

/** External circumstance without any inner reaction („brak czasu”, „szef”). */
export function findExternal(text: string, lexicon: Lexicon): { match: string; exampleKey: string } | null {
  const external = findFirst(text, lexicon.external);
  if (!external || isInternal(text, lexicon)) return null;
  const group = lexicon.externalReframes.find((g) => hasAny(external.text, g.patterns));
  return { match: external.text, exampleKey: group?.key ?? 'default' };
}

export function validateObstacleText(obstacle: Obstacle, lexicon: Lexicon): Nudge[] {
  if (isBlank(obstacle.text)) return [];
  const nudges: Nudge[] = [];
  const parts = splitObstacles(obstacle.text, lexicon);
  if (parts.length >= 2) nudges.push({ code: 'obstacle.multiple', field: 'obstacle.text', options: parts });
  const external = findExternal(obstacle.text, lexicon);
  if (external) {
    nudges.push({
      code: 'obstacle.external',
      field: 'obstacle.text',
      match: external.match,
      exampleKey: external.exampleKey,
    });
  } else if (parts.length < 2 && countWords(obstacle.text) <= 2) {
    nudges.push({ code: 'obstacle.tooGeneral', field: 'obstacle.text', match: trimPunctuation(obstacle.text) });
  }
  return nudges;
}

// A belief usually hides inside a thought („myślę, że się nie nadaję”), so it wins ties.
const TYPE_PRIORITY: InnerObstacleType[] = ['belief', 'thought', 'emotion', 'temptation', 'habit'];

/** Best guess of the obstacle type, used only as a hint next to the chips. */
export function suggestObstacleType(text: string, lexicon: Lexicon): InnerObstacleType | null {
  let best: InnerObstacleType | null = null;
  let bestScore = 0;
  for (const type of TYPE_PRIORITY) {
    const score = new Set(findMatches(text, lexicon.internal[type]).map((m) => m.start)).size;
    if (score > bestScore) {
      best = type;
      bestScore = score;
    }
  }
  return best;
}
