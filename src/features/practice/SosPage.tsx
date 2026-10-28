import { Timer } from 'lucide-react';
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
import type { PlanUse } from '../../domain/types';
import { useWakeLock } from '../../lib/wakeLock';
import { PlanCard } from '../woop/PlanCard';
import { useLoadedWoop } from '../woop/useLoadedWoop';

const FIRST_STEP_SECONDS = 120;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Optional 2-minute countdown for the first, smallest step. */
function FirstStepTimer() {
  const s = pl.sos;
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(FIRST_STEP_SECONDS);
  useWakeLock(startedAt !== null && remaining > 0);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, FIRST_STEP_SECONDS - Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const running = startedAt !== null && remaining > 0;
  return (
    <section
      aria-labelledby="timer-title"
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
    >
      <h2 id="timer-title" className="text-lg font-bold">
        {s.timerTitle}
      </h2>
      <p className="text-muted">{s.timerBody}</p>
      {startedAt === null ? (
        <div>
          <Button
            variant="secondary"
            onClick={() => setStartedAt(Date.now())}
            icon={<Timer aria-hidden="true" className="size-5" />}
          >
            {s.timerStart}
          </Button>
        </div>
      ) : running ? (
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold" aria-hidden="true">
            {clock(remaining)}
          </p>
          <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${(remaining / FIRST_STEP_SECONDS) * 100}%` }}
            />
          </div>
          <p className="sr-only" role="status">
            {t(s.timerRemaining, { time: clock(Math.ceil(remaining / 30) * 30) })}
          </p>
          <div>
            <Button variant="ghost" onClick={() => setStartedAt(null)}>
              {s.timerStop}
            </Button>
          </div>
        </div>
      ) : (
        <p role="status" className="font-semibold text-ok">
          {s.timerDone}
        </p>
      )}
    </section>
  );
}

export function SosPage() {
  const loaded = useLoadedWoop();
  const s = pl.sos;
  const [answer, setAnswer] = useState<PlanUse | null>(null);
  const savedRef = useRef<HTMLParagraphElement>(null);
  useDocumentTitle(s.title);

  useEffect(() => {
    if (answer) savedRef.current?.focus();
  }, [answer]);

  if (loaded.state === 'loading') return <Loading />;
  if (loaded.state === 'missing') return <WoopNotFound />;
  const { woop } = loaded;

  const save = async (planUsed: PlanUse) => {
    await practiceRepository.add({ woopId: woop.id, kind: 'sos', planUsed });
    setAnswer(planUsed);
  };

  return (
    <div className="flex flex-col gap-5">
      <FocusHeader label={woop.wish.short || woop.wish.text} closeTo="/" />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{s.title}</h1>
        <p className="text-lg text-muted">{s.intro}</p>
      </header>
      <PlanCard woop={woop} />
      <FirstStepTimer />
      <section aria-labelledby="used-title" className="flex flex-col gap-3">
        <h2 id="used-title" className="text-lg font-bold">
          {s.question}
        </h2>
        {answer ? (
          <Notice tone="success" role="status">
            <p ref={savedRef} tabIndex={-1} className="outline-none">
              {answer === 'no' ? s.savedNo : s.saved}
            </p>
          </Notice>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(['yes', 'partly', 'no'] as const).map((value) => (
              <Button key={value} variant={value === 'yes' ? 'primary' : 'secondary'} onClick={() => void save(value)}>
                {s.answers[value]}
              </Button>
            ))}
          </div>
        )}
      </section>
      <div>
        <ButtonLink to="/" variant="secondary">
          {s.back}
        </ButtonLink>
      </div>
    </div>
  );
}
