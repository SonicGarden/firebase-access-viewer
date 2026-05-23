import clsx from 'clsx';

export type TabKey = 'timeline' | 'grouped';

type TabItem = {
  key: TabKey;
  label: string;
  count: number;
};

type TabsProps = {
  items: TabItem[];
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export const Tabs = ({ items, active, onChange }: TabsProps) => {
  return (
    <div
      role='tablist'
      className='inline-flex gap-0.5 p-0.5 bg-[var(--bg-subtle)] rounded-[7px]'
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            type='button'
            role='tab'
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={clsx(
              'inline-flex items-center gap-1.5 px-[11px] py-1 rounded-[5px]',
              'text-xs font-medium transition',
              selected
                ? [
                    'bg-[var(--bg)] text-[var(--fg)]',
                    'shadow-[0_1px_2px_oklch(0%_0_0/0.06),0_0_0_1px_var(--line)]',
                  ]
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            )}
          >
            {item.label}
            <span
              className={clsx(
                'font-mono tabular-nums text-[10.5px] font-medium',
                'px-[5px] py-[1px] rounded-full',
                selected
                  ? 'bg-[var(--accent-weak)] text-[var(--accent-fg)]'
                  : 'bg-[var(--bg-hover)] text-[var(--fg-muted)]'
              )}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
