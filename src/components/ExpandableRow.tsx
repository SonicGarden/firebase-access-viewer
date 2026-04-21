import clsx from 'clsx';
import type { KeyboardEvent, ReactNode } from 'react';

type ExpandableRowProps = {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  body?: ReactNode;
  disabled?: boolean;
  headerClassName?: string;
};

export const ExpandableRow = ({
  expanded,
  onToggle,
  header,
  body,
  disabled,
  headerClassName,
}: ExpandableRowProps) => {
  const interactive = !disabled;
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className='border-b border-gray-100 dark:border-gray-800 last:border-b-0'>
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={interactive ? expanded : undefined}
        onClick={interactive ? onToggle : undefined}
        onKeyDown={handleKey}
        className={clsx(
          'flex items-center gap-2 px-2 py-1.5 text-sm',
          interactive && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60',
          headerClassName
        )}
      >
        {header}
        <span
          aria-hidden='true'
          className={clsx(
            'w-4 shrink-0 text-xs text-gray-400 text-center transition-transform',
            interactive ? (expanded ? 'rotate-90' : '') : 'invisible'
          )}
        >
          ▸
        </span>
      </div>
      {expanded && interactive && body}
    </div>
  );
};
