import clsx from 'clsx';

const colorClass = (status: number) => {
  const group = Math.floor(status / 100);
  if (group === 2) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (group === 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  if (group === 5) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

export const StatusBadge = ({ status }: { status: number }) => {
  return (
    <span
      className={clsx(
        'inline-block px-1.5 py-0.5 rounded text-xs font-mono tabular-nums',
        colorClass(status)
      )}
    >
      {status}
    </span>
  );
};
