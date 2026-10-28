import { Check, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { pl } from '../../../content/pl';
import { Button } from '../../../components/ui/Button';
import { backupSentence, planSentence } from '../../../domain/summary/format';
import type { StepProps } from '../types';
import { VisualizationPause } from '../VisualizationPause';

type Stage = 'say' | 'visualize' | 'ready';

/** „Powiedz plan raz na głos”, then a short visualization of acting on it. */
export function RehearseStep({ woop, settings, finish, editing }: StepProps) {
  const [stage, setStage] = useState<Stage>('say');
  const finishRef = useRef<HTMLButtonElement>(null);
  const visualizeRef = useRef<HTMLHeadingElement>(null);
  const backup = backupSentence(woop.plan);

  useEffect(() => {
    if (stage === 'ready') finishRef.current?.focus();
    if (stage === 'visualize') visualizeRef.current?.focus();
  }, [stage]);

  return (
    <>
      <figure className="rounded-2xl border-2 border-plan bg-surface px-5 py-4">
        <figcaption className="text-sm font-semibold text-plan">{pl.rehearse.sayAloud}</figcaption>
        <p className="mt-2 text-2xl leading-snug font-semibold text-balance">{planSentence(woop.plan)}</p>
        {backup && <p className="mt-3 text-muted">{backup}</p>}
      </figure>

      {stage === 'say' && (
        <div>
          <Button
            size="lg"
            onClick={() => setStage('visualize')}
            icon={<Check aria-hidden="true" className="size-5" />}
          >
            {pl.rehearse.spoken}
          </Button>
        </div>
      )}

      {stage === 'visualize' && (
        <section aria-labelledby="rehearse-visualize" className="flex flex-col gap-3">
          <h2 id="rehearse-visualize" ref={visualizeRef} tabIndex={-1} className="text-xl font-bold outline-none">
            {pl.rehearse.visualizeTitle}
          </h2>
          <p className="text-muted">{pl.rehearse.visualizeBody}</p>
          <VisualizationPause
            defaultSeconds={15}
            options={[10, 15, 20]}
            chime={settings.chime}
            onDone={() => setStage('ready')}
            onSkip={() => setStage('ready')}
          />
        </section>
      )}

      {stage === 'ready' && (
        <div>
          <Button ref={finishRef} size="lg" onClick={finish} icon={<Save aria-hidden="true" className="size-5" />}>
            {editing ? pl.rehearse.finishEdit : pl.rehearse.finish}
          </Button>
        </div>
      )}
    </>
  );
}
