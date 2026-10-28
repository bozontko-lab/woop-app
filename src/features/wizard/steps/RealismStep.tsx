import { useEffect, useRef } from 'react';
import { pl } from '../../../content/pl';
import { t } from '../../../content/t';
import { Button } from '../../../components/ui/Button';
import { Slider } from '../../../components/ui/Slider';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

export type RealismBand = 'high' | 'mid' | 'low';

export function realismBand(value: number): RealismBand {
  if (value >= 7) return 'high';
  return value >= 4 ? 'mid' : 'low';
}

interface RealismStepProps extends StepProps {
  /** Shown after „Dalej” for values 1–6. */
  panel: RealismBand | null;
  onValueChange: () => void;
}

/** The moment of mental contrasting: vision and obstacle side by side, then a realism check. */
export function RealismStep({
  woop,
  update,
  registerField,
  showRequired,
  panel,
  goTo,
  advance,
  onValueChange,
}: RealismStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const r = pl.realism;

  useEffect(() => {
    if (panel) headingRef.current?.focus();
  }, [panel]);

  return (
    <>
      <AnswerContext
        items={[
          { label: pl.summary.labels.wish, value: woop.wish.short || woop.wish.text },
          { label: pl.summary.labels.outcome, value: woop.outcome.short || woop.outcome.text },
          { label: pl.summary.labels.obstacle, value: woop.obstacle.short || woop.obstacle.text },
        ]}
      />
      <Slider
        ref={registerField}
        label={pl.steps.realism.label}
        value={woop.realism}
        onChange={(realism) => {
          update((w) => ({ ...w, realism }));
          onValueChange();
        }}
        minLabel={r.minLabel}
        maxLabel={r.maxLabel}
        error={showRequired && woop.realism === null ? pl.common.requiredSlider : undefined}
      />

      {panel === 'mid' && woop.realism !== null && (
        <section
          aria-labelledby="realism-title"
          className="flex flex-col gap-3 rounded-2xl border-2 border-hint-line bg-hint-bg p-4 text-hint-fg"
        >
          <h2 id="realism-title" ref={headingRef} tabIndex={-1} className="text-lg font-bold outline-none">
            {r.mid.title}
          </h2>
          <p>{t(r.mid.body, { value: woop.realism })}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => goTo('wish-text')}>{r.mid.refine}</Button>
            <Button variant="secondary" onClick={advance}>
              {r.mid.proceed}
            </Button>
          </div>
        </section>
      )}

      {panel === 'low' && (
        <section
          aria-labelledby="realism-title"
          className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-surface p-4"
        >
          <h2 id="realism-title" ref={headingRef} tabIndex={-1} className="text-lg font-bold outline-none">
            {r.low.title}
          </h2>
          <p>{r.low.body}</p>
          <ul className="flex flex-col gap-2">
            {[
              { label: r.low.change, hint: r.low.changeHint, onClick: () => goTo('wish-text') },
              { label: r.low.release, hint: r.low.releaseHint, onClick: () => goTo('realism-release') },
              { label: r.low.proceed, hint: r.low.proceedHint, onClick: advance },
            ].map((option) => (
              <li key={option.label}>
                <button
                  type="button"
                  onClick={option.onClick}
                  className="flex min-h-14 w-full flex-col items-start rounded-xl border border-field bg-surface px-4 py-3 text-left hover:bg-surface-2"
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-sm text-muted">{option.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
