import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { formatLongDate, toLocalISODate } from '../dates';
import { formatPlanSentence } from '../plan';
import { normalize } from '../text/normalize';
import type { Plan, Timeframe, Woop } from '../types';

export function describeTimeframe(timeframe: Timeframe | null): string {
  if (!timeframe) return pl.summary.full.empty;
  const date = timeframe.endDate ? formatLongDate(timeframe.endDate, pl.locale) : '';
  switch (timeframe.type) {
    case 'today':
      return t(pl.timeframeSummaryToday, { date });
    case 'date':
      return t(pl.timeframeSummaryDate, { date });
    default:
      return t(pl.timeframeSummary, { label: pl.timeframes[timeframe.type].label, date });
  }
}

export function planSentence(plan: Pick<Plan, 'ifText' | 'thenText'>): string {
  return formatPlanSentence(plan, pl.planBuilder.sentence, pl.lexicon);
}

export function backupSentence(plan: Plan): string | null {
  const then = plan.backupPlan
    .trim()
    .replace(/^to\s+/iu, '')
    .replace(/[.\s]+$/u, '');
  return then ? t(pl.planBuilder.backupSentence, { then }) : null;
}

export function createdDate(woop: Woop): string {
  return formatLongDate(toLocalISODate(new Date(woop.createdAt)), pl.locale);
}

/** „woop-3-treningi-tygodniowo-2026-10-28.md” */
export function exportFileName(woop: Woop, extension: string, suffix = ''): string {
  const slug = normalize(woop.wish.short || woop.wish.text)
    .split(' ')
    .filter(Boolean)
    .slice(0, 5)
    .join('-');
  const date = toLocalISODate(new Date(woop.createdAt));
  return [pl.exportText.fileBase, slug, date, suffix].filter(Boolean).join('-') + `.${extension}`;
}
