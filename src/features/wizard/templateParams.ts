import { pl } from '../../content/pl';
import { t, type TemplateParams } from '../../content/t';
import { formatDate } from '../../domain/dates';
import { lowerFirst, trimPunctuation } from '../../domain/shortVersion';
import type { WoopCore } from '../../domain/types';

const inline = (text: string) => lowerFirst(trimPunctuation(text));

/** Values for `{placeholders}` in step texts (see pl.steps). */
export function templateParams(woop: WoopCore): TemplateParams {
  const timeframe = woop.timeframe;
  const content = pl.timeframes[timeframe?.type ?? 'week'];
  const date = timeframe?.endDate ? formatDate(timeframe.endDate, pl.locale, { day: 'numeric', month: 'long' }) : '';
  const context = [woop.obstacle.when, woop.obstacle.where].map((s) => trimPunctuation(s)).filter(Boolean);
  return {
    timeframeIn: t(content.in, { date }),
    period: content.period,
    areaIn: woop.area ? pl.areas[woop.area].in : pl.areaNoneIn,
    wish: trimPunctuation(woop.wish.short || woop.wish.text),
    outcome: inline(woop.outcome.short || woop.outcome.text),
    obstacle: inline(woop.obstacle.short || woop.obstacle.text),
    context: context.length
      ? t(pl.obstacleContext.visualizeContext, { value: context.join(pl.obstacleContext.joiner) })
      : '',
  };
}
