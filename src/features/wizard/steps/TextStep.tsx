import { pl } from '../../../content/pl';
import { TextArea } from '../../../components/ui/Field';
import { getText, setText } from '../../../domain/woop';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

type TextField = 'wish.text' | 'wish.successCriterion' | 'outcome.text' | 'obstacle.text';

/** Open question with a growing text area (wish, success criterion, outcome, obstacle). */
export function TextStep({ step, woop, update, registerField, showRequired }: StepProps) {
  const field = step.field as TextField;
  const content = pl.steps[step.id];
  const value = getText(woop, field);
  const missing = showRequired && !step.isComplete(woop);

  const context =
    step.id === 'outcome-text'
      ? [{ label: pl.common.yourWish, value: woop.wish.text }]
      : step.id === 'obstacle-text'
        ? [
            { label: pl.common.yourWish, value: woop.wish.short || woop.wish.text },
            { label: pl.common.yourOutcome, value: woop.outcome.short || woop.outcome.text },
          ]
        : step.id === 'wish-success'
          ? [{ label: pl.common.yourWish, value: woop.wish.text }]
          : [];

  return (
    <>
      <AnswerContext items={context} />
      <TextArea
        ref={registerField}
        label={content.label ?? content.title}
        labelHidden
        placeholder={content.placeholder}
        value={value}
        onValueChange={(text) => update((w) => setText(w, field, text))}
        error={missing ? pl.common.required : undefined}
        rows={3}
      />
    </>
  );
}
