import { forwardRef } from 'react';
import clsx from 'clsx';
import { SearchIcon, XIcon } from '@/components/Icons';

type FilterInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER =
  'Filter by path — try users/, workspaces/acme-hq, cover.jpg';

export const FilterInput = forwardRef<HTMLInputElement, FilterInputProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    return (
      <div className={clsx('relative flex items-center', className)}>
        <SearchIcon
          aria-hidden='true'
          className='absolute left-[9px] w-[13px] h-[13px] text-[var(--fg-faint)] pointer-events-none'
        />
        <input
          ref={ref}
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onChange('');
              e.currentTarget.blur();
            }
          }}
          placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
          className={clsx(
            'w-full pl-7 pr-[30px] py-1.5 text-xs rounded-md',
            'bg-[var(--bg-subtle)] text-[var(--fg)] border border-transparent',
            'placeholder:text-[var(--fg-faint)]',
            'focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--line-strong)]',
            'focus:ring-[3px] focus:ring-[var(--focus-ring)]',
            'transition'
          )}
        />
        {value ? (
          <button
            type='button'
            onClick={() => onChange('')}
            aria-label='Clear filter'
            className={clsx(
              'absolute right-1.5 top-1/2 -translate-y-1/2',
              'w-[18px] h-[18px] inline-flex items-center justify-center rounded',
              'text-[var(--fg-faint)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]'
            )}
          >
            <XIcon className='w-2.5 h-2.5' />
          </button>
        ) : (
          <span
            aria-hidden='true'
            className={clsx(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'font-mono text-[10px] px-[5px] py-[1px] rounded',
              'bg-[var(--bg)] text-[var(--fg-faint)] border border-[var(--line)]'
            )}
          >
            /
          </span>
        )}
      </div>
    );
  }
);

FilterInput.displayName = 'FilterInput';
