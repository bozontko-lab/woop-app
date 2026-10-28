import type { Lexicon } from '../types';

const combined = new WeakMap<Lexicon, string[]>();

/** All inner-obstacle markers (emotions, habits, thoughts, beliefs, temptations). */
export function internalMarkers(lexicon: Lexicon): string[] {
  let list = combined.get(lexicon);
  if (!list) {
    list = Object.values(lexicon.internal).flat();
    combined.set(lexicon, list);
  }
  return list;
}

export function isBlank(text: string): boolean {
  return text.trim().length === 0;
}
