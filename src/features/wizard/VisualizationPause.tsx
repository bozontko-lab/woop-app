import { Play, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { cx } from '../../components/ui/cx';
import { playChime, primeAudio, vibrate } from '../../lib/chime';
import { useWakeLock } from '../../lib/wakeLock';

interface VisualizationPauseProps {
  defaultSeconds: number;
  options: number[];
  chime: boolean;
  onDone: () => void;
  onSkip: () => void;
  doneLabel?: string;
}

type Phase = 'idle' | 'running' | 'finished';

const BREATH_CYCLE = 10;
const INHALE = 4;

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** „Zamknij oczy…” pause: breathing circle and countdown, started by the user. */
export function VisualizationPause({
  defaultSeconds,
  options,
  chime,
  onDone,
  onSkip,
  doneLabel,
}: VisualizationPauseProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [elapsed, setElapsed] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const startedAt = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  useWakeLock(phase === 'running');

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => {
      const value = (Date.now() - startedAt.current) / 1000;
      if (value >= seconds) {
        setElapsed(seconds);
        setPhase('finished');
        setAnnouncement(pl.pause.finished);
        if (chime) {
          playChime();
          vibrate();
        }
      } else {
        setElapsed(value);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, seconds, chime]);

  useEffect(() => {
    if (phase === 'finished') nextRef.current?.focus();
  }, [phase]);

  const start = () => {
    if (chime) primeAudio();
    startedAt.current = Date.now();
    setElapsed(0);
    setPhase('running');
    setAnnouncement(t(pl.pause.started, { n: seconds }));
  };

  const remaining = Math.max(0, Math.ceil(seconds - elapsed));
  const breathing = elapsed % BREATH_CYCLE < INHALE ? pl.pause.inhale : pl.pause.exhale;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative grid size-56 place-items-center" role="img" aria-label={pl.pause.breathingLabel}>
        <div
          aria-hidden="true"
          className={cx(
            'absolute inset-0 rounded-full bg-primary/20',
            phase === 'running' ? 'motion-safe:animate-breathe' : 'scale-[0.62]',
          )}
        />
        <div aria-hidden="true" className="absolute inset-12 rounded-full bg-primary/25" />
        <div aria-hidden="true" className="relative flex flex-col items-center gap-1 text-center">
          {phase === 'running' ? (
            <>
              <span className="text-3xl font-bold">{breathing}</span>
              <span className="text-base font-medium text-fg tabular-nums">
                {t(pl.pause.remaining, { time: clock(remaining) })}
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold tabular-nums">{clock(phase === 'idle' ? seconds : 0)}</span>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      {phase === 'finished' && <p className="text-center text-lg font-medium">{pl.pause.finished}</p>}

      {phase === 'idle' && (
        <div className="w-full">
          <ChipGroup
            legend={pl.pause.durationLabel}
            options={options.map((value) => ({ value: String(value), label: t(pl.pause.seconds, { n: value }) }))}
            value={String(seconds)}
            onChange={(value) => setSeconds(Number(value))}
          />
        </div>
      )}

      <div className="flex w-full flex-wrap justify-center gap-3">
        {phase === 'idle' && (
          <>
            <Button size="lg" onClick={start} icon={<Play aria-hidden="true" className="size-5" />}>
              {pl.pause.start}
            </Button>
            <Button variant="ghost" onClick={onSkip} icon={<SkipForward aria-hidden="true" className="size-5" />}>
              {pl.pause.skip}
            </Button>
          </>
        )}
        {phase === 'running' && (
          <Button variant="secondary" onClick={onDone}>
            {pl.pause.finishEarly}
          </Button>
        )}
        {phase === 'finished' && (
          <Button ref={nextRef} size="lg" onClick={onDone}>
            {doneLabel ?? pl.pause.next}
          </Button>
        )}
      </div>
    </div>
  );
}
