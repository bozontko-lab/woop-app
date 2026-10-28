import { computeTimeframe } from '../timeframe';
import type { Woop } from '../types';
import { createDraft } from '../woop';

/** The reference WOOP from docs/SPEC.md. It must pass every validator without a single nudge. */
export const REFERENCE = {
  wish: '3 treningi w tygodniu przez najbliższy miesiąc',
  outcome: 'więcej energii, lepszy sen, satysfakcja z dotrzymanego słowa',
  obstacle: 'po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”',
  planIf: 'po pracy pomyślę „zrobię to jutro”',
  planThen: 'od razu założę strój i zrobię 10 minut rozgrzewki',
  planSentence: 'Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój i zrobię 10 minut rozgrzewki.',
} as const;

export function referenceWoop(overrides: Partial<Woop> = {}): Woop {
  const base = createDraft('ref-1', '2026-10-28T09:00:00.000Z');
  return {
    ...base,
    timeframe: computeTimeframe('month', '2026-10-28'),
    area: 'movement',
    wish: {
      text: REFERENCE.wish,
      short: '3 treningi w tygodniu',
      successCriterion: '12 odhaczonych treningów w kalendarzu',
      importance: 8,
    },
    outcome: { text: REFERENCE.outcome, short: 'Więcej energii, lepszy sen', deeper: [] },
    obstacle: {
      text: REFERENCE.obstacle,
      short: 'Zmęczenie i „zrobię to jutro”',
      type: 'thought',
      when: 'po pracy',
      where: 'w domu',
      time: '18:00',
    },
    realism: 7,
    plan: {
      ifText: REFERENCE.planIf,
      thenText: REFERENCE.planThen,
      backupPlan: '',
      short: '„Zrobię to jutro” → założę strój',
    },
    status: 'active',
    wizard: null,
    ...overrides,
  };
}
