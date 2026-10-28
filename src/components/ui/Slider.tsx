import { forwardRef, useId, type ReactNode } from 'react';
import { pl } from '../../content/pl';
import { t } from '../../content/t';
import { cx } from './cx';

interface SliderProps {
  label: ReactNode;
  labelHidden?: boolean;
  value: number | null;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  error?: ReactNode;
}

/**
 * 1–10 scale on a native range input. It starts without a value: the thumb is
 * shown faded in the middle until the user touches it (see DECISIONS.md, 9).
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, labelHidden, value, onChange, minLabel, maxLabel, error },
  ref,
) {
  const id = useId();
  const set = (raw: string) => onChange(Math.min(10, Math.max(1, Math.round(Number(raw)))));
  const unset = value === null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={cx('font-semibold', labelHidden && 'sr-only')}>
          {label}
        </label>
        <output htmlFor={id} className="ml-auto text-3xl font-bold tabular-nums text-primary" aria-hidden="true">
          {unset ? '–' : value}
          <span className="text-base font-medium text-muted">/10</span>
        </output>
      </div>
      <input
        ref={ref}
        id={id}
        type="range"
        min={1}
        max={10}
        step={1}
        value={value ?? 5}
        aria-valuetext={unset ? pl.common.sliderUnset : t(pl.common.sliderValue, { value })}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => set(event.target.value)}
        onClick={(event) => set(event.currentTarget.value)}
        onKeyUp={(event) => {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
            set(event.currentTarget.value);
        }}
        className={cx('h-11 w-full cursor-pointer accent-[var(--primary)]', unset && 'opacity-50')}
      />
      <div className="flex justify-between text-sm text-muted" aria-hidden="true">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
