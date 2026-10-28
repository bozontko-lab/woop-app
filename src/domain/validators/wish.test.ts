import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import type { Wish } from '../types';
import { isWishConcrete, validateImportance, validateWishSuccess, validateWishText } from './wish';

const lex = pl.lexicon;
const wish = (text: string, extra: Partial<Wish> = {}): Wish => ({
  text,
  short: '',
  successCriterion: '',
  importance: 7,
  ...extra,
});
const codes = (text: string) => validateWishText(wish(text), lex).map((n) => n.code);

describe('wish validators', () => {
  it.each([
    ['Więcej się ruszać', 'Więcej'],
    ['Lepiej się odżywiać', 'Lepiej'],
    ['Być bardziej cierpliwym', 'bardziej'],
    ['Zacząć biegać', 'Zacząć'],
    ['Schudnąć', 'Schudnąć'],
  ])('flags a vague wish: %s', (text, match) => {
    const [nudge] = validateWishText(wish(text), lex);
    expect(nudge).toMatchObject({ code: 'wish.vague', field: 'wish.text', match });
  });

  it.each([
    '3 treningi w tygodniu przez najbliższy miesiąc',
    'Biegać więcej – 3 razy po 5 km',
    'Czytać więcej: 20 stron codziennie',
    'Zacząć biegać w poniedziałki i czwartki',
  ])('accepts a wish with a measure: %s', (text) => {
    expect(codes(text)).not.toContain('wish.vague');
  });

  it.each([
    ['Dostać awans', 'Dostać'],
    ['Żeby szef mnie docenił', 'Żeby szef'],
    ['Żeby ktoś mnie wreszcie zauważył', 'Żeby ktoś'],
    ['Dostać podwyżkę do końca roku', 'Dostać'],
  ])('flags a wish that depends on others: %s', (text, match) => {
    const nudge = validateWishText(wish(text), lex).find((n) => n.code === 'wish.dependent');
    expect(nudge?.match).toBe(match);
  });

  it.each(['Nie jeść słodyczy', 'Przestać palić', 'Rzucić scrollowanie wieczorem', 'Żeby nie odkładać raportu'])(
    'proposes an approach goal for: %s',
    (text) => {
      expect(codes(text)).toContain('wish.negation');
    },
  );

  it('accepts the reference wish without any suggestion', () => {
    expect(codes('3 treningi w tygodniu przez najbliższy miesiąc')).toEqual([]);
  });

  it('asks for a success criterion only when it is empty', () => {
    expect(validateWishSuccess(wish('x'))).toMatchObject([{ code: 'wish.noCriterion' }]);
    expect(validateWishSuccess(wish('x', { successCriterion: '12 treningów' }))).toEqual([]);
  });

  it('asks about ownership when importance is 4 or less', () => {
    expect(validateImportance(wish('x', { importance: 4 }))).toMatchObject([{ code: 'wish.lowImportance' }]);
    expect(validateImportance(wish('x', { importance: 5 }))).toEqual([]);
    expect(validateImportance(wish('x', { importance: null }))).toEqual([]);
  });

  it('treats a vague wish with a measurable success criterion as concrete', () => {
    expect(isWishConcrete(wish('Więcej się ruszać'), lex)).toBe(false);
    expect(isWishConcrete(wish('Więcej się ruszać', { successCriterion: '3 treningi tygodniowo' }), lex)).toBe(true);
    expect(isWishConcrete(wish('Dostać awans', { successCriterion: '1 rozmowa z szefem' }), lex)).toBe(false);
  });
});
