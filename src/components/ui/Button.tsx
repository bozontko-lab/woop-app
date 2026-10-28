import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from './cx';

type Variant = 'primary' | 'obstacle' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 select-none';
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm',
  obstacle: 'bg-obstacle text-on-obstacle hover:bg-obstacle-hover shadow-sm',
  secondary: 'border border-field bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-primary hover:bg-surface-2 underline-offset-4 hover:underline',
  danger: 'border border-danger text-danger bg-surface hover:bg-surface-2',
};
const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-6 text-lg',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', block = false): string {
  return cx(base, variants[variant], sizes[size], block && 'w-full');
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
}

export function Button({ variant, size, block, icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(buttonClass(variant, size, block), className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
}

export function ButtonLink({ variant, size, block, icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cx(buttonClass(variant, size, block), className as string)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
