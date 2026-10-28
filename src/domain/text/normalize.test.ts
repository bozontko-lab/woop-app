import { describe, expect, it } from 'vitest';
import {
  contentWords,
  countWords,
  fingerprint,
  normalize,
  overlapRatio,
  pluralPl,
  similarStem,
  stripDiacritics,
  tokenize,
} from './normalize';

describe('normalize', () => {
  it('strips Polish characters, including ł', () => {
    expect(stripDiacritics('Zażółć gęślą jaźń Łódź')).toBe('Zazolc gesla jazn Lodz');
  });

  it('lower-cases and collapses punctuation', () => {
    expect(normalize('  Brak CZASU, „zrobię to jutro”!  ')).toBe('brak czasu zrobie to jutro');
  });

  it('tokenizes with positions and keeps the original form', () => {
    const tokens = tokenize('Po pracy – czuję zmęczenie.');
    expect(tokens.map((t) => t.raw)).toEqual(['Po', 'pracy', 'czuję', 'zmęczenie']);
    expect(tokens[2]).toMatchObject({ lower: 'czuję', norm: 'czuje', start: 11, end: 16 });
    expect(countWords('3 treningi → 10 minut')).toBe(4);
  });

  it('compares stems', () => {
    expect(similarStem('treningi', 'trening')).toBe(true);
    expect(similarStem('schudne', 'schudnac')).toBe(true);
    expect(similarStem('lepszy', 'lepiej')).toBe(false);
    expect(similarStem('kg', 'kg')).toBe(true);
  });

  it('measures overlap of content words', () => {
    const a = contentWords('schudnę 5 kg', ['się']);
    const b = contentWords('Schudnąć 5 kg do wakacji', ['do']);
    expect(overlapRatio(a, b)).toBe(1);
    expect(overlapRatio([], b)).toBe(0);
  });

  it('picks Polish plural forms', () => {
    const words = (n: number) => pluralPl(n, 'słowo', 'słowa', 'słów');
    expect([1, 2, 4, 5, 12, 22, 25].map(words)).toEqual(['słowo', 'słowa', 'słowa', 'słów', 'słów', 'słowa', 'słów']);
  });

  it('fingerprints text independently of case and punctuation', () => {
    expect(fingerprint('Brak czasu!')).toBe(fingerprint('brak   CZASU'));
    expect(fingerprint('brak czasu')).not.toBe(fingerprint('brak pieniędzy'));
  });
});
