import { normalize, tokenize, type Token } from './normalize';

/**
 * Tiny pattern language used by the word lists in `src/content/pl.ts`.
 * Entries may be written with Polish characters; they are normalized here.
 *
 *   "czas"          stem: matches "czas", "czasu", "czasem"…
 *   "=sam"          exact word only
 *   "nie mam czas"  consecutive words, each matched as a stem (or exact with "=")
 *   "!czasopism"    exclusion: words starting with it never match a stem
 */
interface Atom {
  exact: boolean;
  value: string;
}

interface Pattern {
  source: string;
  atoms: Atom[];
}

interface CompiledList {
  patterns: Pattern[];
  excludes: string[];
}

export interface PatternMatch {
  pattern: string;
  /** Original fragment of the text. */
  text: string;
  start: number;
  end: number;
}

const cache = new WeakMap<readonly string[], CompiledList>();

function compile(list: readonly string[]): CompiledList {
  const cached = cache.get(list);
  if (cached) return cached;
  const compiled: CompiledList = { patterns: [], excludes: [] };
  for (const entry of list) {
    const source = entry.trim();
    if (!source) continue;
    if (source.startsWith('!')) {
      const value = normalize(source.slice(1));
      if (value) compiled.excludes.push(value);
      continue;
    }
    const atoms = source
      .split(/\s+/)
      .map((part) => ({ exact: part.startsWith('='), value: normalize(part.replace(/^=/, '')) }))
      .filter((atom) => atom.value.length > 0);
    if (atoms.length > 0) compiled.patterns.push({ source, atoms });
  }
  cache.set(list, compiled);
  return compiled;
}

function atomMatches(token: Token, atom: Atom, excludes: string[]): boolean {
  if (atom.exact) return token.norm === atom.value;
  if (!token.norm.startsWith(atom.value)) return false;
  return !excludes.some((ex) => token.norm.startsWith(ex));
}

/** All matches of the list's patterns in the text, ordered by position. */
export function findMatches(text: string, list: readonly string[]): PatternMatch[] {
  const tokens = tokenize(text);
  const { patterns, excludes } = compile(list);
  const matches: PatternMatch[] = [];
  for (let i = 0; i < tokens.length; i++) {
    for (const pattern of patterns) {
      const last = i + pattern.atoms.length - 1;
      if (last >= tokens.length) continue;
      const ok = pattern.atoms.every((atom, k) => atomMatches(tokens[i + k]!, atom, excludes));
      if (!ok) continue;
      const start = tokens[i]!.start;
      const end = tokens[last]!.end;
      matches.push({ pattern: pattern.source, text: text.slice(start, end), start, end });
    }
  }
  // Prefer the longest match when several start at the same word.
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  return matches;
}

export function findFirst(text: string, list: readonly string[]): PatternMatch | null {
  return findMatches(text, list)[0] ?? null;
}

export function hasAny(text: string, list: readonly string[]): boolean {
  return findFirst(text, list) !== null;
}

/** True when the text starts with one of the patterns (e.g. "nie …", "jeśli …"). */
export function startsWithAny(text: string, list: readonly string[]): PatternMatch | null {
  const first = tokenize(text)[0];
  if (!first) return null;
  return findMatches(text, list).find((m) => m.start === first.start) ?? null;
}
