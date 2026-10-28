import { pl } from '../../content/pl';
import { t } from '../../content/t';
import type { PhaseState } from '../../domain/wizard/engine';
import type { Phase, WoopPhase } from '../../domain/wizard/steps';
import { cx } from './cx';

export const PHASE_STYLES: Record<WoopPhase, { bar: string; text: string; badge: string }> = {
  wish: { bar: 'bg-wish', text: 'text-wish', badge: 'bg-wish text-surface' },
  outcome: { bar: 'bg-outcome', text: 'text-outcome', badge: 'bg-outcome text-surface' },
  obstacle: { bar: 'bg-obstacle', text: 'text-obstacle', badge: 'bg-obstacle text-surface' },
  plan: { bar: 'bg-plan', text: 'text-plan', badge: 'bg-plan text-surface' },
};

interface PhaseProgressProps {
  current: Phase;
  phases: PhaseState[];
}

/** W–O–O–P bar: letters and bars for all four phases, the full name of the current one below. */
export function PhaseProgress({ current, phases }: PhaseProgressProps) {
  const currentIndex = phases.findIndex((p) => p.state === 'current');
  const caption =
    current === 'start'
      ? pl.progress.start
      : t(pl.progress.caption, { index: currentIndex + 1, phase: pl.phases[current].name });
  return (
    <nav aria-label={pl.progress.label} className="flex w-full flex-col gap-2">
      <ol className="grid grid-cols-4 gap-2">
        {phases.map(({ phase, state, progress }) => {
          const style = PHASE_STYLES[phase];
          const content = pl.phases[phase];
          return (
            <li
              key={phase}
              aria-current={state === 'current' ? 'step' : undefined}
              className="flex items-center gap-1.5"
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid size-6 shrink-0 place-items-center rounded-full text-[0.8rem] font-bold',
                  state === 'todo' ? 'border border-field text-muted' : style.badge,
                )}
              >
                {content.letter}
              </span>
              <span className="sr-only">
                {content.name} (
                {state === 'done' ? pl.progress.done : state === 'current' ? pl.progress.current : pl.progress.todo})
              </span>
              <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className={cx('block h-full rounded-full transition-[width] duration-500', style.bar)}
                  style={{
                    width: `${state === 'done' ? 100 : state === 'current' ? Math.max(8, progress * 100) : 0}%`,
                  }}
                />
              </span>
            </li>
          );
        })}
      </ol>
      <p
        aria-hidden="true"
        className={cx('text-sm font-semibold', current === 'start' ? 'text-muted' : PHASE_STYLES[current].text)}
      >
        {caption}
      </p>
    </nav>
  );
}
