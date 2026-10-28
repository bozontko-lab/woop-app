import { pl } from '../../content/pl';
import { t } from '../../content/t';
import type { Woop } from '../types';
import { backupSentence, createdDate, describeTimeframe, planSentence } from './format';

const or = (value: string, fallback: string) => (value.trim() ? value.trim() : fallback);

/** Plain text for the clipboard: the card (short versions) plus the full plan sentence. */
export function buildPlainText(woop: Woop): string {
  const x = pl.exportText;
  const empty = pl.summary.full.empty;
  const lines = [
    t(x.header, { app: pl.app.name }),
    t(x.timeframe, { value: describeTimeframe(woop.timeframe) }),
    t(x.created, { value: createdDate(woop) }),
    '',
    t(x.wish, { value: or(woop.wish.short, or(woop.wish.text, empty)) }),
    t(x.outcome, { value: or(woop.outcome.short, or(woop.outcome.text, empty)) }),
    t(x.obstacle, { value: or(woop.obstacle.short, or(woop.obstacle.text, empty)) }),
    t(x.plan, { value: planSentence(woop.plan) }),
  ];
  const backup = backupSentence(woop.plan);
  if (backup) lines.push(t(x.backup, { value: backup }));
  const scores: string[] = [];
  if (woop.wish.importance !== null) scores.push(t(x.importance, { value: woop.wish.importance }));
  if (woop.realism !== null) scores.push(t(x.realism, { value: woop.realism }));
  if (scores.length) lines.push('', scores.join(' · '));
  return lines.join('\n');
}
