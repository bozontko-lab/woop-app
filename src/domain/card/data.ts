import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { describeTimeframe, planSentence } from '../summary/format';
import type { Woop } from '../types';
import type { CardData } from './layout';

/** What goes on the card: short versions of W, O, O, P plus the full plan sentence. */
export function buildCardData(woop: Woop): CardData {
  const labels = pl.summary.labels;
  return {
    sections: [
      { phase: 'wish', letter: pl.phases.wish.letter, label: labels.wish, text: woop.wish.short || woop.wish.text },
      {
        phase: 'outcome',
        letter: pl.phases.outcome.letter,
        label: labels.outcome,
        text: woop.outcome.short || woop.outcome.text,
      },
      {
        phase: 'obstacle',
        letter: pl.phases.obstacle.letter,
        label: labels.obstacle,
        text: woop.obstacle.short || woop.obstacle.text,
      },
      {
        phase: 'plan',
        letter: pl.phases.plan.letter,
        label: labels.plan,
        text: woop.plan.short || planSentence(woop.plan),
      },
    ],
    planSentence: planSentence(woop.plan),
    footer: t(pl.card.footer, { app: pl.app.name, timeframe: describeTimeframe(woop.timeframe) }),
  };
}
