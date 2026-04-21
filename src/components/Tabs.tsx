import clsx from 'clsx';

export type TabKey = 'timeline' | 'grouped';

type TabItem = {
  key: TabKey;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export const Tabs = ({ items, active, onChange }: TabsProps) => {
  return (
    <div role='tablist' className='flex border-b border-gray-200 dark:border-gray-700'>
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
              'px-3 py-1.5 text-sm border-b-2 -mb-px',
              selected
                ? 'border-sky-500 text-sky-700 dark:text-sky-300 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
