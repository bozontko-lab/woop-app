import { describe, expect, it } from 'vitest';
import { pl } from '../content/pl';
import { REFERENCE, referenceWoop } from './__fixtures__/reference';
import {
  capitalize,
  extractQuote,
  stripLeadingFillers,
  suggestObstacleShort,
  suggestPlanShort,
  suggestShort,
} from './shortVersion';

const lex = pl.lexicon;

describe('short versions', () => {
  it('cuts long text at a phrase boundary', () => {
    expect(suggestShort(REFERENCE.wish, lex)).toBe('3 treningi w tygodniu');
  });

  it('keeps whole comma-separated phrases', () => {
    expect(suggestShort(REFERENCE.outcome, lex)).toBe('Więcej energii, lepszy sen');
  });

  it('removes leading fillers', () => {
    expect(suggestShort('Chcę przeczytać 2 książki w tym miesiącu', lex)).toBe('Przeczytać 2 książki w tym miesiącu');
    expect(stripLeadingFillers('Będę mieć więcej energii', lex.fillerStart)).toBe('więcej energii');
  });

  it('keeps short text as it is (capitalized, without the final dot)', () => {
    expect(suggestShort('lepszy sen.', lex)).toBe('Lepszy sen');
    expect(suggestShort('', lex)).toBe('');
  });

  it('builds the obstacle short version from the emotion and the inner voice', () => {
    expect(suggestObstacleShort(referenceWoop().obstacle, lex)).toBe('Zmęczenie i „zrobię to jutro”');
    expect(
      suggestObstacleShort(
        {
          text: 'mówię sobie „jeszcze tylko jeden odcinek”',
          short: '',
          type: null,
          when: 'wieczorem',
          where: '',
          time: '',
        },
        lex,
      ),
    ).toBe('Wieczorem: „jeszcze tylko jeden odcinek”');
  });

  it('builds the plan short version: trigger → action', () => {
    const woop = referenceWoop();
    expect(suggestPlanShort(woop.plan, woop.obstacle, lex)).toBe('„Zrobię to jutro” → założę strój');
  });

  it('extracts quotes and capitalizes behind them', () => {
    expect(extractQuote('mówię sobie „zrobię to jutro”')).toBe('zrobię to jutro');
    expect(extractQuote('mówię sobie "zrobię to jutro"')).toBe('zrobię to jutro');
    expect(extractQuote('bez cytatu')).toBeNull();
    expect(capitalize('„zrobię”')).toBe('„Zrobię”');
  });
});

describe('short versions never break a quotation', () => {
  it('drops an unfinished quote instead of cutting it', () => {
    expect(suggestShort('Po powrocie do domu siadam i mówię sobie „wyjdę za chwilę, naprawdę”', pl.lexicon, 6)).toBe(
      'Po powrocie do domu siadam',
    );
  });

  it('keeps the obstacle short version within 6 words', () => {
    const obstacle = {
      text: 'Po powrocie do domu siadam na kanapie i mówię sobie „wyjdę za chwilę”',
      short: '',
      type: null,
      when: 'po powrocie do domu',
      where: '',
      time: '',
    };
    expect(suggestObstacleShort(obstacle, pl.lexicon)).toBe('„Wyjdę za chwilę”');
  });
});
