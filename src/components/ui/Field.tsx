import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from './cx';

const control =
  'w-full rounded-xl border border-field bg-surface px-4 py-3 text-base text-fg placeholder:text-muted/80 shadow-inner focus-visible:outline-3 focus-visible:outline-offset-2 aria-invalid:border-danger';

interface FieldFrameProps {
  id: string;
  label: ReactNode;
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}

function FieldFrame({ id, label, labelHidden, hint, error, children }: FieldFrameProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cx('font-semibold', labelHidden && 'sr-only')}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown, extra?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null, extra].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label: ReactNode;
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  /** Ctrl/Cmd+Enter submits the surrounding form. */
  submitOnModEnter?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    labelHidden,
    hint,
    error,
    value,
    onValueChange,
    submitOnModEnter = true,
    className,
    id: idProp,
    rows = 3,
    'aria-describedby': extraDescribedBy,
    ...rest
  },
  forwarded,
) {
  const generated = useId();
  const id = idProp ?? generated;
  const inner = useRef<HTMLTextAreaElement | null>(null);

  // Grow with the content so the whole answer stays visible on a phone.
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  return (
    <FieldFrame id={id} label={label} labelHidden={labelHidden} hint={hint} error={error}>
      <textarea
        ref={(el) => {
          inner.current = el;
          if (typeof forwarded === 'function') forwarded(el);
          else if (forwarded) forwarded.current = el;
        }}
        id={id}
        rows={rows}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error, extraDescribedBy)}
        className={cx(control, 'min-h-24 resize-none leading-relaxed', className)}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (submitOnModEnter && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        {...rest}
      />
    </FieldFrame>
  );
});

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: ReactNode;
  labelHidden?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    labelHidden,
    hint,
    error,
    value,
    onValueChange,
    className,
    id: idProp,
    type = 'text',
    'aria-describedby': extraDescribedBy,
    ...rest
  },
  ref,
) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldFrame id={id} label={label} labelHidden={labelHidden} hint={hint} error={error}>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error, extraDescribedBy)}
        className={cx(control, 'min-h-12', className)}
        onChange={(event) => onValueChange(event.target.value)}
        {...rest}
      />
    </FieldFrame>
  );
});
