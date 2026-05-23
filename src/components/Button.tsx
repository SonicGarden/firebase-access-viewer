import clsx from 'clsx';
import type { ReactNode } from 'react';

type ButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  danger?: boolean;
  title?: string;
  ariaLabel?: string;
};

export const Button = ({
  children,
  onClick,
  className,
  icon,
  danger,
  title,
  ariaLabel,
}: ButtonProps) => {
  return (
    <button
      type='button'
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
        'bg-transparent border border-transparent text-[var(--fg-muted)]',
        'hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        danger && 'hover:bg-[var(--err-bg)] hover:text-[var(--err-fg)]',
        className
      )}
    >
      {icon && (
        <span aria-hidden='true' className='inline-flex w-3 h-3 opacity-80'>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
