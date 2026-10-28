import { pl } from '../../../content/pl';
import { TextInput } from '../../../components/ui/Field';
import { cx } from '../../../components/ui/cx';
import type { Obstacle } from '../../../domain/types';
import type { StepProps } from '../types';
import { AnswerContext } from './Context';

function QuickChips({
  label,
  chips,
  value,
  onPick,
}: {
  label: string;
  chips: string[];
  value: string;
  onPick: (chip: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="-mt-2 flex flex-wrap gap-2">
      {chips.map((chip) => {
        const active = value.trim().toLowerCase() === chip;
        return (
          <button
            key={chip}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(active ? '' : chip)}
            className={cx(
              'min-h-11 rounded-full border px-4 text-sm',
              active ? 'border-primary bg-primary-soft font-semibold' : 'border-field bg-surface hover:bg-surface-2',
            )}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

export function ContextStep({ woop, update, registerField }: StepProps) {
  const c = pl.obstacleContext;
  const set = (patch: Partial<Obstacle>) => update((w) => ({ ...w, obstacle: { ...w.obstacle, ...patch } }));
  return (
    <>
      <AnswerContext items={[{ label: pl.common.yourObstacle, value: woop.obstacle.text }]} />
      <TextInput
        ref={registerField}
        label={c.whenLabel}
        placeholder={c.whenPlaceholder}
        value={woop.obstacle.when}
        onValueChange={(when) => set({ when })}
      />
      <QuickChips
        label={`${c.chipsLabel}: ${c.whenLabel}`}
        chips={c.whenChips}
        value={woop.obstacle.when}
        onPick={(when) => set({ when })}
      />
      <TextInput
        label={c.whereLabel}
        placeholder={c.wherePlaceholder}
        value={woop.obstacle.where}
        onValueChange={(where) => set({ where })}
      />
      <QuickChips
        label={`${c.chipsLabel}: ${c.whereLabel}`}
        chips={c.whereChips}
        value={woop.obstacle.where}
        onPick={(where) => set({ where })}
      />
      <TextInput
        type="time"
        label={c.timeLabel}
        hint={c.timeHint}
        value={woop.obstacle.time}
        onValueChange={(time) => set({ time })}
        className="max-w-40"
      />
    </>
  );
}
