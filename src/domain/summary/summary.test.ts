import { describe, expect, it } from 'vitest';
import { pl } from '../../content/pl';
import { referenceWoop } from '../__fixtures__/reference';
import { qualityChecklist } from './checklist';
import { describeTimeframe, exportFileName } from './format';
import { buildJsonExport } from './json';
import { buildMarkdown } from './markdown';
import { buildPlainText } from './text';

describe('quality checklist', () => {
  const failing = (woop = referenceWoop()) =>
    qualityChecklist(woop, pl.lexicon)
      .filter((i) => !i.ok)
      .map((i) => i.id);

  it('points to the right step for each problem', () => {
    const woop = referenceWoop();
    expect(failing({ ...woop, wish: { ...woop.wish, text: 'Dostać awans' } })).toEqual(['wishConcrete']);
    expect(failing({ ...woop, timeframe: null })).toEqual(['timeframe']);
    expect(failing({ ...woop, obstacle: { ...woop.obstacle, text: 'Brak czasu' } })).toEqual(['obstacleInternal']);
    expect(failing({ ...woop, plan: { ...woop.plan, ifText: '' } })).toEqual(['planIfThen']);
    expect(failing({ ...woop, plan: { ...woop.plan, thenText: 'postaram się ćwiczyć' } })).toEqual(['concreteAction']);
    const items = qualityChecklist(woop, pl.lexicon);
    expect(Object.fromEntries(items.map((i) => [i.id, i.fixStep]))).toEqual({
      wishConcrete: 'wish-text',
      timeframe: 'start-timeframe',
      obstacleInternal: 'obstacle-text',
      planIfThen: 'plan-builder',
      concreteAction: 'plan-builder',
    });
  });
});

describe('exports', () => {
  it('describes the timeframe', () => {
    expect(describeTimeframe(referenceWoop().timeframe)).toBe('Najbliższy miesiąc · do 27 listopada 2026');
    expect(describeTimeframe({ type: 'today', startDate: '2026-10-28', endDate: '2026-10-28' })).toBe(
      'Dziś · 28 października 2026',
    );
    expect(describeTimeframe({ type: 'date', startDate: '2026-10-28', endDate: '2026-12-24' })).toBe(
      'Do 24 grudnia 2026',
    );
  });

  it('copies the card as plain text', () => {
    const text = buildPlainText(referenceWoop());
    expect(text).toContain('WOOPmylife – mój WOOP');
    expect(text).toContain('Życzenie: 3 treningi w tygodniu');
    expect(text).toContain('Najlepszy rezultat: Więcej energii, lepszy sen');
    expect(text).toContain('Przeszkoda: Zmęczenie i „zrobię to jutro”');
    expect(text).toContain(
      'Plan: Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój i zrobię 10 minut rozgrzewki.',
    );
    expect(text).toContain('Ważność: 8/10 · Realność: 7/10');
  });

  it('adds the backup plan when there is one', () => {
    const woop = referenceWoop();
    const text = buildPlainText({ ...woop, plan: { ...woop.plan, backupPlan: 'to następnego dnia zrobię 10 minut.' } });
    expect(text).toContain(
      'Plan awaryjny: Jeśli jednak odpuszczę albo opuszczę dzień, to następnego dnia zrobię 10 minut.',
    );
  });

  it('exports Markdown with full answers', () => {
    const md = buildMarkdown({ ...referenceWoop(), parkedObstacles: ['telefon'] });
    expect(md).toMatch(/^# Mój WOOP: 3 treningi w tygodniu/u);
    expect(md).toContain('- **Plan:** Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój');
    expect(md).toContain('**Po czym poznam, że się udało:** 12 odhaczonych treningów w kalendarzu');
    expect(md).toContain('- **Rodzaj przeszkody:** Myśl / wymówka');
    expect(md).toContain('### Pomysły na kolejny WOOP');
    expect(md).toContain('- **Status:** Aktywny');
  });

  it('exports versioned JSON without the wizard state', () => {
    const json = JSON.parse(
      buildJsonExport(
        { ...referenceWoop(), wizard: { stepId: 'realism', dismissed: ['x'] } },
        '2026-10-28T12:00:00.000Z',
      ),
    );
    expect(json).toMatchObject({
      app: 'WOOPmylife',
      kind: 'woop',
      schemaVersion: 1,
      exportedAt: '2026-10-28T12:00:00.000Z',
    });
    expect(json.woop.wizard).toBeNull();
    expect(json.woop.wish.text).toBe(referenceWoop().wish.text);
  });

  it('builds readable file names', () => {
    expect(exportFileName(referenceWoop(), 'md')).toBe('woop-3-treningi-w-tygodniu-2026-10-28.md');
    expect(exportFileName(referenceWoop(), 'png', '9x16')).toBe('woop-3-treningi-w-tygodniu-2026-10-28-9x16.png');
  });
});
