import { countWords } from '../text/normalize';
import { suggestShort } from '../shortVersion';
import type { FieldPath, Lexicon, Nudge } from '../types';

export const SHORT_MAX_WORDS = 6;

export function validateShort(text: string, field: FieldPath, lexicon: Lexicon): Nudge[] {
  const count = countWords(text);
  if (count <= SHORT_MAX_WORDS) return [];
  const suggestion = suggestShort(text, lexicon, SHORT_MAX_WORDS);
  return [
    {
      code: 'short.tooLong',
      field,
      match: String(count),
      ...(suggestion && suggestion !== text.trim() ? { suggestion } : {}),
    },
  ];
}
