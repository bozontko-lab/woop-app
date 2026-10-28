import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import { REFERENCE } from '../__fixtures__/reference';
import type { Obstacle, Plan, Wish } from '../types';
import { hasFirstPersonVerb, validateAction, validatePlan, validatePlanSentence } from './plan';

const lex = pl.lexicon;
const wish: Wish = { text: REFERENCE.wish, short: '3 treningi w tygodniu', successCriterion: '', importance: 8 };
const obstacle: Obstacle = { text: REFERENCE.obstacle, short: '', type: null, when: 'po pracy', where: '', time: '' };
const plan = (ifText: string, thenText: string): Plan => ({ ifText, thenText, backupPlan: '', short: '' });
const actionCodes = (text: string) => validateAction(text, 'plan.thenText', lex).map((n) => n.code);

describe('plan validators', () => {
  it('accepts the reference plan', () => {
    expect(validatePlan(plan(REFERENCE.planIf, REFERENCE.planThen), wish, obstacle, lex)).toEqual([]);
    expect(validatePlanSentence(REFERENCE.planSentence, lex)).toEqual([]);
  });

  it.each([
    ['postaram się więcej ćwiczyć', 'postaram się'],
    ['spróbuję się nie poddawać', 'spróbuję'],
    ['muszę iść na siłownię', 'muszę'],
    ['będę bardziej zmotywowana', 'będę bardziej'],
    ['jakoś się zbiorę', 'jakoś'],
  ])('asks what exactly will be done instead of „%s”', (text, match) => {
    expect(validateAction(text, 'plan.thenText', lex)).toMatchObject([{ code: 'plan.weakThen', match }]);
  });

  it('asks for the 1st person instead of an infinitive', () => {
    expect(actionCodes('założyć strój i wyjść')).toEqual(['plan.infinitive']);
  });

  it('asks for an action when there is no verb', () => {
    expect(actionCodes('spacer')).toEqual(['plan.noAction']);
    expect(actionCodes('książka zamiast telefonu')).toEqual(['plan.noAction']);
  });

  it('suggests an action instead of pure avoidance', () => {
    expect(actionCodes('nie sięgnę po telefon')).toEqual(['plan.negativeThen']);
    expect(actionCodes('nie sięgnę po telefon, tylko otworzę książkę')).toEqual([]);
  });

  it.each([
    'od razu założę strój',
    'wezmę 3 głębokie oddechy',
    'przeczytam jedną stronę',
    'zjem jabłko',
    'powiem sobie „tylko 5 minut”',
    'zaloze stroj i wyjde',
  ])('accepts a concrete action: %s', (text) => {
    expect(hasFirstPersonVerb(text, lex)).toBe(true);
    expect(actionCodes(text)).toEqual([]);
  });

  it('flags an „if” part that describes the wish', () => {
    const [nudge] = validatePlan(plan('chcę ćwiczyć 3 razy w tygodniu', 'pójdę na siłownię'), wish, obstacle, lex);
    expect(nudge).toMatchObject({ code: 'plan.ifIsWish', field: 'plan.ifText' });
    expect(nudge?.suggestion).toBe('po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”');
  });

  it('does not treat „nie chce mi się” as a wish', () => {
    const o: Obstacle = { ...obstacle, text: 'nie chce mi się ćwiczyć po pracy' };
    expect(validatePlan(plan('nie chce mi się ćwiczyć', 'założę strój'), wish, o, lex)).toEqual([]);
  });

  it('offers to split a whole sentence typed into the „to” part', () => {
    const [nudge] = validatePlan(plan('', 'jeśli będę zmęczona to pójdę na spacer'), wish, obstacle, lex);
    expect(nudge).toMatchObject({ code: 'plan.notIfThen', options: ['będę zmęczona', 'pójdę na spacer'] });
  });

  it('flags a free-text plan without the if–then form', () => {
    expect(validatePlanSentence('Postaram się więcej ćwiczyć', lex).map((n) => n.code)).toEqual([
      'plan.notIfThen',
      'plan.weakThen',
    ]);
    expect(validatePlanSentence('Będę ćwiczyć 3 razy w tygodniu', lex).map((n) => n.code)).toEqual(['plan.notIfThen']);
    expect(validatePlanSentence('Jeśli wrócę z pracy, to postaram się poćwiczyć', lex).map((n) => n.code)).toEqual([
      'plan.weakThen',
    ]);
  });
});
