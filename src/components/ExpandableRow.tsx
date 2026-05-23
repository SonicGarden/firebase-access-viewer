import clsx from 'clsx';
import type { KeyboardEvent, ReactNode } from 'react';
import { CaretIcon } from '@/components/Icons';

type ExpandableRowProps = {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  body?: ReactNode;
  disabled?: boolean;
  headerClassName?: string;
  headerGridTemplate: string;
  rowHeight: number;
};

export const ExpandableRow = ({
  expanded,
  onToggle,
  header,
  body,
  disabled,
  headerClassName,
  headerGridTemplate,
  rowHeight,
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
    <div
      data-row='request'
      className='border-b border-[var(--line-soft)] last:border-b-0'
    >
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={interactive ? expanded : undefined}
        onClick={interactive ? onToggle : undefined}
        onKeyDown={handleKey}
        style={{ gridTemplateColumns: headerGridTemplate, height: `${rowHeight}px` }}
        className={clsx(
          'relative grid items-center gap-2.5 px-[14px] select-none',
          'text-[12.5px] text-[var(--fg)]',
          interactive ? 'cursor-pointer' : 'cursor-default',
          interactive && !expanded && 'hover:bg-[var(--bg-hover)]',
          expanded && [
            'bg-[var(--bg-expanded)]',
            "before:content-[''] before:absolute before:left-0 before:inset-y-0",
            'before:w-[2px] before:bg-[var(--accent)]',
          ],
          headerClassName
        )}
      >
        {header}
        <CaretIcon
          aria-hidden='true'
          className={clsx(
            'w-[14px] h-[14px] transition-transform duration-[120ms]',
            interactive ? 'text-[var(--fg-dim)]' : 'invisible',
            expanded && 'rotate-90 text-[var(--accent)]'
          )}
        />
      </div>
      {expanded && interactive && body}
    </div>
  );
};
