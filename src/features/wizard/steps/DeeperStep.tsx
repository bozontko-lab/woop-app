import { useEffect, useRef, useState } from 'react';
import { pl } from '../../../content/pl';
import { Button } from '../../../components/ui/Button';
import { TextArea } from '../../../components/ui/Field';
import type { StepProps } from '../types';
import { Quote } from './Context';

/** „A co ci to da?” – asked once, and a second time on request. */
export function DeeperStep({ woop, update, registerField }: StepProps) {
  const [first = '', second = ''] = woop.outcome.deeper;
  const [showSecond, setShowSecond] = useState(second.trim().length > 0);
  const [askedAgain, setAskedAgain] = useState(false);
  const secondRef = useRef<HTMLTextAreaElement>(null);
  const content = pl.steps['outcome-deeper'];

  // „Zapytaj jeszcze raz” moves straight to the new question.
  useEffect(() => {
    if (askedAgain) secondRef.current?.focus();
  }, [askedAgain]);

  const setLevel = (index: 0 | 1, text: string) =>
    update((w) => {
      const deeper = [w.outcome.deeper[0] ?? '', w.outcome.deeper[1] ?? ''];
      deeper[index] = text;
      return { ...w, outcome: { ...w.outcome, deeper: deeper[1] ? deeper : [deeper[0]!].filter((d) => d) } };
    });

  return (
    <>
      <Quote label={pl.deeper.previous}>{woop.outcome.text}</Quote>
      <TextArea
        ref={registerField}
        label={content.label!}
        labelHidden
        placeholder={content.placeholder}
        value={first}
        onValueChange={(text) => setLevel(0, text)}
        rows={2}
      />
      {showSecond ? (
        <TextArea
          ref={secondRef}
          label={pl.deeper.secondLabel}
          value={second}
          onValueChange={(text) => setLevel(1, text)}
          rows={2}
        />
      ) : (
        first.trim() && (
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setShowSecond(true);
                setAskedAgain(true);
              }}
            >
              {pl.deeper.again}
            </Button>
          </div>
        )
      )}
    </>
  );
}
