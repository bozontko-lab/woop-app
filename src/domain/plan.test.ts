import { describe, expect, it } from 'vitest';
import { pl } from '../content/pl';
import { REFERENCE } from './__fixtures__/reference';
import { buildIfPrefill, cleanIfPart, cleanThenPart, formatPlanSentence, parseIfThen } from './plan';
import type { Obstacle } from './types';

const lex = pl.lexicon;
const obstacle = (text: string, when = '', where = ''): Obstacle => ({
  text,
  short: '',
  type: null,
  when,
  where,
  time: '',
});

describe('plan helpers', () => {
  it('formats the if–then sentence', () => {
    expect(
      formatPlanSentence({ ifText: REFERENCE.planIf, thenText: REFERENCE.planThen }, pl.planBuilder.sentence, lex),
    ).toBe(REFERENCE.planSentence);
  });

  it('cleans duplicated words typed by the user', () => {
    expect(cleanIfPart('Jeśli wrócę z pracy, to', lex)).toBe('wrócę z pracy');
    expect(cleanIfPart('kiedy wracam do domu', lex)).toBe('wracam do domu');
    expect(cleanThenPart('to od razu założę strój.')).toBe('od razu założę strój');
    expect(formatPlanSentence({ ifText: 'jeśli wrócę', thenText: 'to wyjdę.' }, pl.planBuilder.sentence, lex)).toBe(
      'Jeśli wrócę, to wyjdę.',
    );
    expect(formatPlanSentence({ ifText: 'wrócę', thenText: '' }, pl.planBuilder.sentence, lex)).toBe(
      'Jeśli wrócę, to …',
    );
  });

  it('parses a free-text plan and ignores „to” inside quotes', () => {
    expect(parseIfThen(REFERENCE.planSentence, lex)).toEqual({
      ifText: REFERENCE.planIf,
      thenText: REFERENCE.planThen,
    });
    expect(parseIfThen('Kiedy sięgnę po telefon to odłożę go do szuflady', lex)).toEqual({
      ifText: 'sięgnę po telefon',
      thenText: 'odłożę go do szuflady',
    });
    expect(parseIfThen('Będę ćwiczyć więcej', lex)).toBeNull();
    expect(parseIfThen('Jeśli będzie dobrze', lex)).toBeNull();
  });

  it('prefills the „if” part from the obstacle and its context', () => {
    expect(buildIfPrefill(obstacle(REFERENCE.obstacle, 'po pracy'))).toBe(REFERENCE.obstacle);
    expect(buildIfPrefill(obstacle('Czuję zmęczenie.', 'wieczorem', 'w domu'))).toBe(
      'wieczorem w domu czuję zmęczenie',
    );
    expect(buildIfPrefill(obstacle(REFERENCE.obstacle, 'po pracy', 'w domu'))).toBe(
      'po pracy w domu czuję zmęczenie i mówię sobie „zrobię to jutro”',
    );
    expect(buildIfPrefill(obstacle(''))).toBe('');
  });
});
