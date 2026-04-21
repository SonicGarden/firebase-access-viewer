import { firebaseServices, isSuccessfulStatus } from '@/utils';
import type { Request } from '@/utils/requestHistory';

const Cell = ({ label, value }: { label: string; value: number | string }) => (
  <div className='flex flex-col'>
    <span className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>{label}</span>
    <span className='text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100'>{value}</span>
  </div>
);

export const SummaryBar = ({ requests }: { requests: Request[] }) => {
  const total = requests.length;
  const errorCount = requests.filter((r) => !isSuccessfulStatus(r.status)).length;
  const uniquePaths = new Set(requests.map((r) => r.paths).filter((p) => p !== '')).size;

  return (
    <div className='flex flex-wrap items-stretch gap-4 px-3 py-2 rounded border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'>
      <Cell label='Total' value={total < 100 ? total : ':D'} />
      {firebaseServices.map(({ name }) => (
        <Cell
          key={name}
          label={name[0].toUpperCase() + name.slice(1)}
          value={requests.filter((r) => r.service === name).length}
        />
      ))}
      <Cell label='Errors' value={errorCount} />
      <Cell label='Unique paths' value={uniquePaths} />
    </div>
  );
};
