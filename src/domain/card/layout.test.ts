import { describe, expect, it } from 'vitest';
import { CARD_SIZES, layoutCard, wrapText, type CardData, type DrawOp } from './layout';

/** Rough text width: average glyph is ~0.55 of the font size. */
const measure = (text: string, font: string) => text.length * Number(/(\d+)px/u.exec(font)?.[1] ?? 16) * 0.55;

const data: CardData = {
  sections: [
    { phase: 'wish', letter: 'W', label: 'Życzenie', text: '3 treningi w tygodniu' },
    { phase: 'outcome', letter: 'O', label: 'Najlepszy rezultat', text: 'Więcej energii, lepszy sen' },
    { phase: 'obstacle', letter: 'O', label: 'Przeszkoda', text: 'Zmęczenie i „zrobię to jutro”' },
    { phase: 'plan', letter: 'P', label: 'Plan', text: '„Zrobię to jutro” → założę strój' },
  ],
  planSentence: 'Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój i zrobię 10 minut rozgrzewki.',
  footer: 'WOOPmylife · Najbliższy miesiąc · do 27 listopada 2026',
};

const texts = (ops: DrawOp[]) => ops.filter((op): op is Extract<DrawOp, { kind: 'text' }> => op.kind === 'text');

describe('card layout', () => {
  it('wraps text to the width', () => {
    const lines = wrapText('jeden dwa trzy cztery pięć sześć siedem', 120, '10px x', measure);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) expect(measure(line, '10px x')).toBeLessThanOrEqual(120);
  });

  it.each(['story', 'square'] as const)('keeps every text inside the safe area (%s)', (format) => {
    const box = CARD_SIZES[format];
    const ops = layoutCard(data, format, measure);
    expect(ops[0]).toMatchObject({ kind: 'background', width: box.width, height: box.height });
    for (const op of texts(ops)) {
      expect(op.y).toBeGreaterThan(box.top);
      expect(op.y).toBeLessThan(box.height);
      if (op.align === 'left') expect(op.x + measure(op.text, op.font)).toBeLessThanOrEqual(box.width - box.side + 1);
    }
    expect(texts(ops).map((op) => op.text)).toEqual(
      expect.arrayContaining(['ŻYCZENIE', 'PLAN', '3 treningi w tygodniu']),
    );
  });

  it('leaves the top of the wallpaper free for the lock-screen clock', () => {
    const ops = layoutCard(data, 'story', measure);
    const firstY = Math.min(...ops.filter((op) => op.kind !== 'background').map((op) => ('y' in op ? op.y : op.y1)));
    expect(firstY).toBeGreaterThanOrEqual(CARD_SIZES.story.top);
  });

  it('shrinks fonts for long answers', () => {
    const long = { ...data, sections: data.sections.map((s) => ({ ...s, text: `${s.text} `.repeat(6) })) };
    const normalFont = texts(layoutCard(data, 'square', measure)).find((op) => op.text.startsWith('3 treningi'))!.font;
    const smallFont = texts(layoutCard(long, 'square', measure)).find((op) => op.text.startsWith('3 treningi'))!.font;
    expect(Number(/(\d+)px/u.exec(smallFont)![1])).toBeLessThan(Number(/(\d+)px/u.exec(normalFont)![1]));
  });
});
