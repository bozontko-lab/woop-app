import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { WoopNotFound } from '../../app/errors';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button, ButtonLink } from '../../components/ui/Button';
import { FocusHeader } from '../../components/ui/FocusHeader';
import { Loading } from '../../components/ui/Loading';
import { Notice } from '../../components/ui/Notice';
import { practiceRepository } from '../../data';
import { useSettings } from '../../data/hooks';
import { lowerFirst, trimPunctuation } from '../../domain/shortVersion';
import { VisualizationPause } from '../wizard/VisualizationPause';
import { PlanCard } from '../woop/PlanCard';
import { useLoadedWoop } from '../woop/useLoadedWoop';

type Stage = 0 | 1 | 2 | 'done';
const PAUSE = 20;

/** ~60 s: picture the outcome, then the obstacle, then read the plan aloud. */
export function RehearsalPage() {
  const loaded = useLoadedWoop();
  const settings = useSettings();
  const r = pl.rehearsal;
  const [stage, setStage] = useState<Stage>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useDocumentTitle(r.title);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stage]);

  if (loaded.state === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;
  const inline = (text: string) => lowerFirst(trimPunctuation(text));

  const finish = async () => {
    await practiceRepository.add({ woopId: woop.id, kind: 'rehearsal' });
    setStage('done');
  };

  const steps = [
    { title: r.outcomeTitle, body: t(r.outcomeBody, { outcome: inline(woop.outcome.short || woop.outcome.text) }) },
    {
      title: r.obstacleTitle,
      body: t(r.obstacleBody, { obstacle: inline(woop.obstacle.short || woop.obstacle.text) }),
    },
    { title: r.planTitle, body: '' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <FocusHeader label={r.title} closeTo="/" />
      {stage === 'done' ? (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold outline-none">
            {r.title}
          </h1>
          <Notice tone="success" role="status">
            {r.done}
          </Notice>
          <div>
            <ButtonLink to="/">{r.back}</ButtonLink>
          </div>
        </>
      ) : (
        <>
          <header className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-muted">{t(r.stepLabel, { index: stage + 1 })}</p>
            <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold outline-none">
              {steps[stage]!.title}
            </h1>
            {steps[stage]!.body && <p className="text-lg text-muted">{steps[stage]!.body}</p>}
            {stage === 0 && <p className="text-sm text-muted">{r.intro}</p>}
          </header>
          {stage < 2 ? (
            <VisualizationPause
              key={stage}
              defaultSeconds={PAUSE}
              options={[15, 20, 30]}
              chime={settings.chime}
              onDone={() => setStage((stage + 1) as Stage)}
              onSkip={() => setStage((stage + 1) as Stage)}
            />
          ) : (
            <>
              <PlanCard woop={woop} label={pl.rehearse.sayAloud} showBackup={false} />
              <div>
                <Button size="lg" onClick={() => void finish()} icon={<Check aria-hidden="true" className="size-5" />}>
                  {r.readAloud}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
