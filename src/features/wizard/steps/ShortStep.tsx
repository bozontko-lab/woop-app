import { useEffect, useMemo } from 'react';
import { pl } from '../../../content/pl';
import { t } from '../../../content/t';
import { Button } from '../../../components/ui/Button';
import { TextInput } from '../../../components/ui/Field';
import { cx } from '../../../components/ui/cx';
import { suggestObstacleShort, suggestPlanShort, suggestShort } from '../../../domain/shortVersion';
import { countWords, pluralPl } from '../../../domain/text/normalize';
import type { Woop } from '../../../domain/types';
import { SHORT_MAX_WORDS } from '../../../domain/validators';
import { getText, setText } from '../../../domain/woop';
import { planSentence } from '../../../domain/summary/format';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

type ShortField = 'wish.short' | 'outcome.short' | 'obstacle.short' | 'plan.short';

function suggestionFor(field: ShortField, woop: Woop): string {
  const lexicon = pl.lexicon;
  switch (field) {
    case 'wish.short':
      return suggestShort(woop.wish.text, lexicon);
    case 'outcome.short':
      return suggestShort(woop.outcome.text, lexicon);
    case 'obstacle.short':
      return suggestObstacleShort(woop.obstacle, lexicon);
    case 'plan.short':
      return suggestPlanShort(woop.plan, woop.obstacle, lexicon);
  }
}

function fullAnswer(field: ShortField, woop: Woop): { label: string; value: string } {
  switch (field) {
    case 'wish.short':
      return { label: pl.common.yourWish, value: woop.wish.text };
    case 'outcome.short':
      return { label: pl.common.yourOutcome, value: woop.outcome.text };
    case 'obstacle.short':
      return { label: pl.common.yourObstacle, value: woop.obstacle.text };
    case 'plan.short':
      return { label: pl.planBuilder.previewLabel, value: planSentence(woop.plan) };
  }
}

/** Short version for the card. Pre-filled with a proposal, so usually it is enough to confirm. */
export function ShortStep({ step, woop, update, registerField, showRequired }: StepProps) {
  const field = step.field as ShortField;
  const content = pl.steps[step.id];
  const value = getText(woop, field);
  const suggestion = useMemo(() => suggestionFor(field, woop), [field, woop]);

  useEffect(() => {
    if (!value.trim() && suggestion) update((w) => setText(w, field, suggestion));
    // Only when the step opens with an empty field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = countWords(value);
  const tooLong = words > SHORT_MAX_WORDS;
  const counter = t(pl.common.wordCount, {
    count: words,
    words: pluralPl(words, pl.common.words.one, pl.common.words.few, pl.common.words.many),
  });

  return (
    <>
      <AnswerContext items={[fullAnswer(field, woop)]} />
      <TextInput
        ref={registerField}
        label={content.label ?? content.title}
        labelHidden
        placeholder={content.placeholder}
        value={value}
        onValueChange={(text) => update((w) => setText(w, field, text))}
        error={showRequired && !value.trim() ? pl.common.required : undefined}
        aria-describedby={`${step.id}-counter`}
        enterKeyHint="next"
      />
      <p
        id={`${step.id}-counter`}
        className={cx('-mt-3 text-sm', tooLong ? 'font-semibold text-hint-fg' : 'text-muted')}
      >
        <span className="sr-only">{pl.shortVersion.counterLabel}: </span>
        {counter}
      </p>
      {suggestion && suggestion !== value.trim() && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 px-4 py-3">
          <p className="flex-1 basis-48">
            {pl.shortVersion.suggestion} <strong className="font-semibold">{suggestion}</strong>
          </p>
          <Button size="sm" variant="secondary" onClick={() => update((w) => setText(w, field, suggestion))}>
            {pl.shortVersion.useSuggestion}
          </Button>
        </div>
      )}
    </>
  );
}
