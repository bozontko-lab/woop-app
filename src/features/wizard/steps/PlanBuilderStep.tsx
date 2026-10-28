import { useEffect } from 'react';
import { pl } from '../../../content/pl';
import { Button } from '../../../components/ui/Button';
import { TextArea } from '../../../components/ui/Field';
import { buildIfPrefill } from '../../../domain/plan';
import { planSentence } from '../../../domain/summary/format';
import type { Plan } from '../../../domain/types';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

/** Sentence builder „Jeśli [przeszkoda + kiedy/gdzie], to [działanie]” with a live preview. */
export function PlanBuilderStep({ woop, update, registerField, showRequired }: StepProps) {
  const b = pl.planBuilder;
  const prefill = buildIfPrefill(woop.obstacle);
  const set = (patch: Partial<Plan>) => update((w) => ({ ...w, plan: { ...w.plan, ...patch } }));

  useEffect(() => {
    if (!woop.plan.ifText.trim() && prefill) set({ ifText: prefill });
    // Pre-fill once, when the step opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AnswerContext items={[{ label: pl.common.yourObstacle, value: woop.obstacle.text }]} />
      <div className="flex flex-col gap-2">
        <TextArea
          label={b.ifLabel}
          hint={b.ifHint}
          value={woop.plan.ifText}
          onValueChange={(ifText) => set({ ifText })}
          error={showRequired && !woop.plan.ifText.trim() ? pl.common.required : undefined}
          rows={2}
        />
        {prefill && woop.plan.ifText.trim() !== prefill && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => set({ ifText: prefill })}>
              {b.fromObstacle}
            </Button>
          </div>
        )}
      </div>
      <TextArea
        ref={registerField}
        label={b.thenLabel}
        hint={b.thenHint}
        placeholder={b.thenPlaceholder}
        value={woop.plan.thenText}
        onValueChange={(thenText) => set({ thenText })}
        error={showRequired && !woop.plan.thenText.trim() ? pl.common.required : undefined}
        rows={2}
      />
      <figure className="rounded-2xl border-2 border-plan bg-surface px-4 py-3">
        <figcaption className="text-sm font-semibold text-plan">{b.previewLabel}</figcaption>
        <p className="mt-1 text-lg font-medium" data-testid="plan-preview">
          {planSentence(woop.plan)}
        </p>
      </figure>
    </>
  );
}
