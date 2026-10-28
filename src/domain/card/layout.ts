/**
 * Pure layout of the WOOP card image. Produces drawing operations that
 * `src/lib/cardCanvas.ts` executes on a canvas, so the layout can be unit-tested.
 */
export type CardFormat = 'story' | 'square';
export type CardPhase = 'wish' | 'outcome' | 'obstacle' | 'plan';

export interface CardSection {
  phase: CardPhase;
  letter: string;
  label: string;
  text: string;
}

export interface CardData {
  sections: CardSection[];
  planSentence: string;
  footer: string;
}

export interface CardTheme {
  background: [string, string];
  text: string;
  muted: string;
  divider: string;
  badgeText: string;
  accents: Record<CardPhase, string>;
}

export type DrawOp =
  | { kind: 'background'; width: number; height: number; colors: [string, string] }
  | { kind: 'circle'; x: number; y: number; r: number; color: string }
  | { kind: 'text'; x: number; y: number; text: string; font: string; color: string; align: 'left' | 'center' }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; color: string; width: number };

export type Measure = (text: string, font: string) => number;

export const CARD_SIZES: Record<
  CardFormat,
  { width: number; height: number; top: number; bottom: number; side: number }
> = {
  // Lock screen: the clock covers roughly the top third, shortcuts the bottom.
  story: { width: 1080, height: 1920, top: 600, bottom: 200, side: 96 },
  square: { width: 1080, height: 1080, top: 88, bottom: 88, side: 88 },
};

export const DEFAULT_THEME: CardTheme = {
  background: ['#0b2e2c', '#1e1b4b'],
  text: '#f8fafc',
  muted: '#cbd5e1',
  divider: 'rgba(248, 250, 252, 0.25)',
  badgeText: '#0b1220',
  accents: { wish: '#fcd34d', outcome: '#5eead4', obstacle: '#fda4af', plan: '#a5b4fc' },
};

const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const font = (weight: number, size: number, style = 'normal') =>
  `${style} ${weight} ${Math.round(size)}px ${FONT_FAMILY}`;

export function wrapText(text: string, maxWidth: number, fontSpec: string, measure: Measure): string[] {
  const words = text.trim().split(/\s+/u).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate, fontSpec) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface Sizes {
  label: number;
  text: number;
  plan: number;
  footer: number;
  badge: number;
  gap: number;
}

function scaled(format: CardFormat, scale: number): Sizes {
  const base: Sizes =
    format === 'story'
      ? { label: 30, text: 56, plan: 34, footer: 28, badge: 30, gap: 52 }
      : { label: 26, text: 46, plan: 28, footer: 24, badge: 26, gap: 34 };
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v * scale])) as unknown as Sizes;
}

export function layoutCard(
  data: CardData,
  format: CardFormat,
  measure: Measure,
  theme: CardTheme = DEFAULT_THEME,
): DrawOp[] {
  const box = CARD_SIZES[format];
  const available = box.height - box.top - box.bottom;
  for (let scale = 1; ; scale -= 0.05) {
    const ops = attempt(data, format, measure, theme, scaled(format, scale));
    if (ops.height <= available || scale <= 0.55) return ops.ops;
  }
}

function attempt(data: CardData, format: CardFormat, measure: Measure, theme: CardTheme, size: Sizes) {
  const box = CARD_SIZES[format];
  const ops: DrawOp[] = [{ kind: 'background', width: box.width, height: box.height, colors: theme.background }];
  const textX = box.side + size.badge * 2 + 28;
  const textWidth = box.width - textX - box.side;
  let y = box.top;

  for (const section of data.sections) {
    const labelFont = font(700, size.label);
    const textFont = font(700, size.text);
    ops.push({
      kind: 'circle',
      x: box.side + size.badge,
      y: y + size.badge,
      r: size.badge,
      color: theme.accents[section.phase],
    });
    ops.push({
      kind: 'text',
      x: box.side + size.badge,
      y: y + size.badge + size.badge * 0.36,
      text: section.letter,
      font: font(800, size.badge),
      color: theme.badgeText,
      align: 'center',
    });
    ops.push({
      kind: 'text',
      x: textX,
      y: y + size.badge + size.label * 0.36,
      text: section.label.toLocaleUpperCase('pl-PL'),
      font: labelFont,
      color: theme.accents[section.phase],
      align: 'left',
    });
    y += size.badge * 2 + size.text * 0.35;
    for (const line of wrapText(section.text || '—', textWidth, textFont, measure)) {
      y += size.text * 1.1;
      ops.push({ kind: 'text', x: textX, y, text: line, font: textFont, color: theme.text, align: 'left' });
    }
    y += size.gap;
  }

  if (data.planSentence) {
    ops.push({ kind: 'line', x1: box.side, y1: y, x2: box.width - box.side, y2: y, color: theme.divider, width: 2 });
    y += size.plan * 0.6;
    const planFont = font(500, size.plan, 'italic');
    for (const line of wrapText(data.planSentence, box.width - box.side * 2, planFont, measure)) {
      y += size.plan * 1.3;
      ops.push({ kind: 'text', x: box.side, y, text: line, font: planFont, color: theme.muted, align: 'left' });
    }
  }

  const footerY = box.height - box.bottom + size.footer * 1.6;
  ops.push({
    kind: 'text',
    x: box.width / 2,
    y: Math.min(footerY, box.height - size.footer),
    text: data.footer,
    font: font(500, size.footer),
    color: theme.muted,
    align: 'center',
  });
  return { ops, height: y - box.top };
}
