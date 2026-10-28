import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import type { Obstacle } from '../types';
import { findExternal, splitObstacles, suggestObstacleType, validateObstacleText } from './obstacle';

const lex = pl.lexicon;
const obstacle = (text: string): Obstacle => ({ text, short: '', type: null, when: '', where: '', time: '' });
const codes = (text: string) => validateObstacleText(obstacle(text), lex).map((n) => n.code);

describe('obstacle validators', () => {
  it.each([
    ['Brak czasu', 'Brak czasu', 'time'],
    ['Nie mam czasu', 'Nie mam czasu', 'time'],
    ['Szef ciągle dokłada mi zadań', 'Szef', 'boss'],
    ['Za dużo pracy', 'za dużo pracy', 'work'],
    ['Dzieci nie dają mi spokoju', 'Dzieci', 'kids'],
    ['Brak pieniędzy na karnet', 'Brak pieniędzy', 'money'],
    ['Pogoda', 'Pogoda', 'weather'],
    ['Inni ludzie mnie rozpraszają', 'Inni ludzie', 'people'],
  ])('flags an external obstacle: %s', (text, match, exampleKey) => {
    const nudge = validateObstacleText(obstacle(text), lex).find((n) => n.code === 'obstacle.external');
    expect(nudge).toMatchObject({ match: expect.stringMatching(new RegExp(match, 'i')), exampleKey });
  });

  it('matches stems: „czas” catches „czasu” and „czasem”', () => {
    expect(findExternal('ciągle brakuje mi czasu', lex)?.match).toBe('czasu');
    expect(findExternal('czasem pada', lex)?.match).toBe('czasem');
  });

  it.each([
    'po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”',
    'Boję się, że mi nie wyjdzie',
    'Wieczorem zamiast ćwiczyć, scrolluję telefon',
    'Czasem czuję lęk przed oceną',
    'Kiedy szef krytykuje, myślę „nie nadaję się” i odkładam zadanie',
  ])('accepts an inner obstacle: %s', (text) => {
    expect(codes(text)).toEqual([]);
  });

  it('asks to pick one when several obstacles are listed', () => {
    const [nudge] = validateObstacleText(obstacle('Dzieci, praca i zmęczenie'), lex);
    expect(nudge).toMatchObject({ code: 'obstacle.multiple', options: ['Dzieci', 'praca', 'zmęczenie'] });
    expect(splitObstacles('- lęk przed oceną\n- perfekcjonizm\n- telefon', lex)).toEqual([
      'lęk przed oceną',
      'perfekcjonizm',
      'telefon',
    ]);
    expect(splitObstacles('Lenistwo; brak motywacji', lex)).toEqual(['Lenistwo', 'brak motywacji']);
  });

  it('does not split a single obstacle with clauses', () => {
    expect(splitObstacles('po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”', lex)).toHaveLength(1);
    expect(splitObstacles('Kiedy wracam z pracy, siadam na kanapie', lex)).toHaveLength(1);
    expect(splitObstacles('Boję się, że mi nie wyjdzie', lex)).toHaveLength(1);
  });

  it('asks for a concrete moment when the obstacle is one or two words', () => {
    expect(codes('Lenistwo')).toEqual(['obstacle.tooGeneral']);
    expect(codes('zmęczenie')).toEqual(['obstacle.tooGeneral']);
    expect(codes('Brak czasu')).toEqual(['obstacle.external']);
  });

  it('suggests an obstacle type', () => {
    expect(suggestObstacleType('po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”', lex)).toBe('thought');
    expect(suggestObstacleType('Boję się oceny i czuję wstyd', lex)).toBe('emotion');
    expect(suggestObstacleType('Wieczorem scrolluję telefon zamiast czytać', lex)).toBe('habit');
    expect(suggestObstacleType('Myślę, że nie nadaję się do biegania', lex)).toBe('belief');
    expect(suggestObstacleType('Kusi mnie czekolada', lex)).toBe('temptation');
    expect(suggestObstacleType('Szef', lex)).toBeNull();
  });
});
