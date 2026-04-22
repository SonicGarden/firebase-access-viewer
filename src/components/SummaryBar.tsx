import { firebaseServices } from '@/utils';
import type { FirebaseServiceName } from '@/utils';
import type { Request } from '@/utils/requestHistory';
import clsx from 'clsx';

const SERVICE_DOT: Record<FirebaseServiceName, string> = {
  firestore: 'bg-[var(--svc-firestore)]',
  storage: 'bg-[var(--svc-storage)]',
};

const emptyServiceCounts = (): Record<FirebaseServiceName, number> =>
  Object.fromEntries(firebaseServices.map(({ name }) => [name, 0])) as Record<
    FirebaseServiceName,
    number
  >;

const capitalize = (name: string) => name[0].toUpperCase() + name.slice(1);

export const SummaryBar = ({ requests }: { requests: Request[] }) => {
  const total = requests.length;
  const serviceCounts = emptyServiceCounts();
  const uniquePathSet = new Set<string>();
  let okCount = 0;
  let warnCount = 0;
  let errCount = 0;
  for (const r of requests) {
    const group = Math.floor(r.status / 100);
    if (group === 2) okCount++;
    else if (group === 4) warnCount++;
    else if (group === 5) errCount++;
    if (r.paths !== '') uniquePathSet.add(r.paths);
    if (r.service !== '') serviceCounts[r.service]++;
  }
  const errorCount = total - okCount;
  const uniquePaths = uniquePathSet.size;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return (
    <>
      <div
        className='grid items-center gap-[18px] px-[16px] py-[14px] border-b border-[var(--line-soft)]'
        style={{ gridTemplateColumns: 'auto 1fr auto' }}
      >
        <div className='flex items-baseline gap-2'>
          <span className='font-mono tabular-nums text-[28px] font-semibold leading-none tracking-[-0.03em] text-[var(--fg)]'>
            {total}
          </span>
          <span className='text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--fg-faint)]'>
            requests
          </span>
        </div>

        <div className='flex justify-center gap-[14px]'>
          {firebaseServices.map(({ name }) => (
            <span
              key={name}
              className='inline-flex items-center gap-[7px] pl-[8px] pr-[10px] py-[4px] rounded-full bg-[var(--bg-subtle)] text-[11.5px] text-[var(--fg-muted)]'
            >
              <span
                aria-hidden='true'
                className={clsx('w-[6px] h-[6px] rounded-full', SERVICE_DOT[name])}
              />
              <span className='font-medium'>{capitalize(name)}</span>
              <span className='font-mono tabular-nums font-semibold text-[var(--fg)]'>
                {serviceCounts[name]}
              </span>
            </span>
          ))}
        </div>

        <div className='flex items-center gap-[18px]'>
          <div className='flex flex-col items-end gap-0.5'>
            <span
              className={clsx(
                'font-mono tabular-nums text-[14px] font-semibold leading-none',
                errorCount > 0 ? 'text-[var(--err-fg)]' : 'text-[var(--fg)]'
              )}
            >
              {errorCount}
            </span>
            <span className='text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fg-faint)]'>
              Errors
            </span>
          </div>
          <div className='flex flex-col items-end gap-0.5'>
            <span className='font-mono tabular-nums text-[14px] font-semibold leading-none text-[var(--fg)]'>
              {uniquePaths}
            </span>
            <span className='text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fg-faint)]'>
              Unique paths
            </span>
          </div>
        </div>
      </div>
      <div className='ratio' aria-hidden='true'>
        <span
          style={{ width: `${pct(okCount)}%`, background: 'var(--ok)' }}
        />
        <span
          style={{ width: `${pct(warnCount)}%`, background: 'var(--warn)' }}
        />
        <span
          style={{ width: `${pct(errCount)}%`, background: 'var(--err)' }}
        />
      </div>
    </>
  );
};
