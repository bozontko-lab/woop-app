import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import type { Outcome, Wish } from '../types';
import { validateOutcomeText } from './outcome';

const lex = pl.lexicon;
const wish = (text: string): Wish => ({ text, short: '', successCriterion: '', importance: 8 });
const outcome = (text: string, deeper: string[] = []): Outcome => ({ text, short: '', deeper });

describe('outcome validator', () => {
  it('asks „a co ci to da?” when the outcome repeats the wish', () => {
    expect(validateOutcomeText(outcome('schudnę 5 kg'), wish('Schudnąć 5 kg do wakacji'), lex)).toMatchObject([
      { code: 'outcome.repeatsWish', field: 'outcome.text' },
    ]);
    expect(
      validateOutcomeText(outcome('Będę trenować 3 razy w tygodniu'), wish('3 treningi w tygodniu'), lex),
    ).toHaveLength(1);
  });

  it('accepts an outcome with a felt benefit', () => {
    const w = wish('3 treningi w tygodniu przez najbliższy miesiąc');
    expect(
      validateOutcomeText(outcome('więcej energii, lepszy sen, satysfakcja z dotrzymanego słowa'), w, lex),
    ).toEqual([]);
    expect(validateOutcomeText(outcome('Schudnę 5 kg i poczuję się lekko'), wish('Schudnąć 5 kg'), lex)).toEqual([]);
  });

  it('counts the deeper answers as well', () => {
    expect(
      validateOutcomeText(outcome('schudnę 5 kg', ['będę mieć więcej energii']), wish('Schudnąć 5 kg'), lex),
    ).toEqual([]);
  });

  it('flags a very short result without a benefit', () => {
    expect(validateOutcomeText(outcome('Raport wysłany'), wish('Wysłać raport do piątku'), lex)).toHaveLength(1);
  });
});
