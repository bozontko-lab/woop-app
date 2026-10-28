import { useId, type ReactNode } from 'react';
import { cx } from './cx';

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
}

interface ChipGroupProps<T extends string> {
  legend: ReactNode;
  legendHidden?: boolean;
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: ReactNode;
  /** Stacked full-width options (with hints) instead of compact chips. */
  layout?: 'chips' | 'list';
  name?: string;
}

/** Single choice built on native radio buttons (keyboard and screen readers work out of the box). */
export function ChipGroup<T extends string>({
  legend,
  legendHidden,
  options,
  value,
  onChange,
  error,
  layout = 'chips',
  name,
}: ChipGroupProps<T>) {
  const generated = useId();
  const group = name ?? generated;
  const errorId = `${group}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined} aria-invalid={error ? true : undefined}>
      <legend className={cx('mb-2 font-semibold', legendHidden && 'sr-only')}>{legend}</legend>
      <div className={layout === 'chips' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
        {options.map((option) => {
          const id = `${group}-${option.value}`;
          const checked = option.value === value;
          return (
            <div key={option.value} className={layout === 'list' ? 'w-full' : undefined}>
              <input
                id={id}
                type="radio"
                name={group}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cx(
                  'flex min-h-12 cursor-pointer select-none rounded-xl border px-4 py-2.5 transition-colors',
                  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
                  layout === 'list' ? 'w-full flex-col justify-center' : 'items-center',
                  checked
                    ? 'border-primary bg-primary-soft font-semibold text-fg ring-1 ring-primary'
                    : 'border-field bg-surface text-fg hover:bg-surface-2',
                )}
              >
                <span>{option.label}</span>
                {option.hint && <span className="text-sm font-normal text-muted">{option.hint}</span>}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
