import { describe, expect, it } from 'vitest';
import { findFirst, findMatches, hasAny, startsWithAny } from './patterns';

describe('patterns', () => {
  it('matches stems regardless of case, Polish characters and endings', () => {
    const list = ['czas'];
    for (const text of ['Nie mam czasu', 'czasem odpuszczam', 'BRAK CZASU', 'czas']) {
      expect(hasAny(text, list)).toBe(true);
    }
    expect(hasAny('Zrobię to jutro', list)).toBe(false);
  });

  it('accepts entries written with Polish characters', () => {
    expect(hasAny('nie mam pieniedzy', ['pieniędz'])).toBe(true);
    expect(hasAny('Nie mam pieniędzy', ['pieniedz'])).toBe(true);
  });

  it('supports exact words, sequences and exclusions', () => {
    expect(hasAny('jestem sama', ['=sam'])).toBe(false);
    expect(hasAny('robię to sam', ['=sam'])).toBe(true);
    expect(findFirst('Wieczorem nie mam czasu na nic', ['nie mam czas'])?.text).toBe('nie mam czasu');
    expect(hasAny('czytam czasopismo', ['czas', '!czasopism'])).toBe(false);
  });

  it('returns the original fragment and prefers the longest match at a position', () => {
    const matches = findMatches('Brak czasu i pieniędzy', ['czas', 'brak czas', 'pieniądz', 'pieniędz']);
    expect(matches.map((m) => m.text)).toEqual(['Brak czasu', 'czasu', 'pieniędzy']);
  });

  it('detects patterns at the start of the text', () => {
    expect(startsWithAny('Jeśli po pracy…', ['jeśli', 'gdy'])?.text).toBe('Jeśli');
    expect(startsWithAny('Po pracy, jeśli…', ['jeśli'])).toBeNull();
  });
});
