import { describe, expect, it } from 'vitest';
import { pl } from '../content/pl';
import { referenceWoop } from './__fixtures__/reference';
import { draftFromObstacle, draftFromTemplate, myObstaclesAndPlans, parkedIdeas } from './library';
import { qualityChecklist } from './summary/checklist';
import { computeTimeframe } from './timeframe';
import { validateStep } from './validators';
import { startNewVersion } from './versioning';
import { createDraft } from './woop';
import { withShortVersions } from './wizard/lifecycle';

describe('library', () => {
  it('collects obstacles and plans, also from earlier versions, without duplicates', () => {
    const woop = referenceWoop({ id: 'a', parkedObstacles: ['telefon'] });
    const v2 = startNewVersion(
      {
        ...woop,
        obstacle: { ...woop.obstacle, text: 'Wieczorem scrolluję telefon' },
        plan: { ...woop.plan, thenText: 'odłożę telefon' },
      },
      woop,
      'newObstacle',
      '2026-11-04T00:00:00.000Z',
    );
    const entries = myObstaclesAndPlans([v2, { ...woop, id: 'b' }, referenceWoop({ id: 'draft', status: 'draft' })]);
    expect(entries.map((e) => e.obstacle)).toEqual(['Wieczorem scrolluję telefon', woop.obstacle.text]);
    expect(parkedIdeas([v2])).toEqual([{ woopId: 'a', wish: '3 treningi w tygodniu', obstacle: 'telefon' }]);
  });

  it('pre-fills a draft from an obstacle or a template', () => {
    const draft = createDraft('d', '2026-10-28T08:00:00.000Z');
    const withObstacle = draftFromObstacle(draft, { obstacle: 'Lęk przed oceną', thenText: 'wezmę 3 oddechy' });
    expect(withObstacle.obstacle.text).toBe('Lęk przed oceną');
    expect(withObstacle.plan.thenText).toBe('wezmę 3 oddechy');
    expect(withObstacle.wizard?.stepId).toBe('start-intro');
  });

  it.each(pl.library.templates.map((template) => [template.label, template] as const))(
    'example „%s” is a good WOOP (no suggestions, full checklist)',
    (_label, template) => {
      const woop = {
        ...draftFromTemplate(createDraft('t', '2026-10-28T08:00:00.000Z'), template),
        timeframe: computeTimeframe('week', '2026-10-28'),
      };
      for (const step of ['wish-text', 'outcome-text', 'obstacle-text', 'plan-builder'] as const) {
        expect(validateStep(step, woop, pl.lexicon)).toEqual([]);
      }
      expect(qualityChecklist(woop, pl.lexicon).filter((item) => !item.ok)).toEqual([]);
    },
  );

  it('starts a quick WOOP for today', () => {
    const quick = createDraft('q', '2026-10-28T08:00:00.000Z', 'quick');
    expect(quick.timeframe).toEqual({ type: 'today', startDate: '2026-10-28', endDate: '2026-10-28' });
  });
});

describe('automatic short versions', () => {
  it.each(pl.library.templates.map((template) => [template.label, template] as const))(
    'never trigger the „too long” hint (%s)',
    (_label, template) => {
      const woop = withShortVersions(
        { ...draftFromTemplate(createDraft('s', '2026-10-28T08:00:00.000Z'), template), status: 'active' },
        pl.lexicon,
      );
      for (const step of ['wish-short', 'outcome-short', 'obstacle-short', 'plan-short'] as const) {
        expect(validateStep(step, woop, pl.lexicon)).toEqual([]);
      }
    },
  );

  it('keeps the plan short version within 6 words for long parts', () => {
    const woop = createDraft('s', '2026-10-28T08:00:00.000Z');
    const plan = {
      ...woop.plan,
      ifText: 'wieczorem zamiast ćwiczyć, scrolluję telefon',
      thenText: 'odłożę telefon do szuflady i założę strój',
    };
    const obstacle = { ...woop.obstacle, text: 'Wieczorem zamiast ćwiczyć, scrolluję telefon' };
    expect(withShortVersions({ ...woop, plan, obstacle }, pl.lexicon).plan.short).toBe(
      'Wieczorem zamiast ćwiczyć → odłożę telefon',
    );
  });
});
