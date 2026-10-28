/** Removes Polish (and other) diacritics: "Zażółć" → "Zazolc". */
export function stripDiacritics(text: string): string {
  return text.replace(/ł/g, 'l').replace(/Ł/g, 'L').normalize('NFD').replace(/\p{M}/gu, '');
}

/** Lower case, no diacritics, punctuation collapsed to single spaces. */
export function normalize(text: string): string {
  return stripDiacritics(text.toLowerCase())
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export interface Token {
  /** As typed. */
  raw: string;
  /** Lower case, diacritics kept (needed for verb endings such as -ę). */
  lower: string;
  /** Lower case, no diacritics. */
  norm: string;
  start: number;
  end: number;
}

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const raw = match[0];
    const start = match.index ?? 0;
    const lower = raw.toLowerCase();
    tokens.push({ raw, lower, norm: stripDiacritics(lower), start, end: start + raw.length });
  }
  return tokens;
}

export function countWords(text: string): number {
  return tokenize(text).length;
}

/** True when two normalized words most likely share a stem ("treningi" ~ "trening"). */
export function similarStem(a: string, b: string): boolean {
  const min = Math.min(a.length, b.length);
  if (min < 3) return a === b;
  let common = 0;
  while (common < min && a[common] === b[common]) common++;
  return common >= Math.min(5, min);
}

/** Meaningful words of a text (normalized), without stopwords and very short words. */
export function contentWords(text: string, stopwords: readonly string[]): string[] {
  const stop = new Set(stopwords.map(normalize));
  return tokenize(text)
    .map((t) => t.norm)
    .filter((w) => !stop.has(w) && (w.length >= 3 || /^\d+$/.test(w)));
}

/** Share of words in `a` that have a similar stem in `b` (0–1). */
export function overlapRatio(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0) return 0;
  const hits = a.filter((wa) => b.some((wb) => similarStem(wa, wb))).length;
  return hits / a.length;
}

/** Stable short fingerprint of a text, used to remember dismissed nudges. */
export function fingerprint(text: string): string {
  const input = normalize(text);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/** Polish plural form picker: 1 słowo, 2 słowa, 5 słów. */
export function pluralPl(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
