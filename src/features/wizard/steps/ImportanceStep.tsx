import { pl } from '../../../content/pl';
import { Slider } from '../../../components/ui/Slider';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

export function ImportanceStep({ woop, update, registerField, showRequired }: StepProps) {
  return (
    <>
      <AnswerContext items={[{ label: pl.common.yourWish, value: woop.wish.text }]} />
      <Slider
        ref={registerField}
        label={pl.steps['wish-importance'].label}
        value={woop.wish.importance}
        onChange={(importance) => update((w) => ({ ...w, wish: { ...w.wish, importance } }))}
        minLabel="1"
        maxLabel="10"
        error={showRequired && woop.wish.importance === null ? pl.common.requiredSlider : undefined}
      />
    </>
  );
}
