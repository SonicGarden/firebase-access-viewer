import clsx from 'clsx';

const toneClass = (status: number) => {
  const group = Math.floor(status / 100);
  if (group === 2) return 'bg-[var(--ok-bg)] text-[var(--ok-fg)]';
  if (group === 4) return 'bg-[var(--warn-bg)] text-[var(--warn-fg)]';
  if (group === 5) return 'bg-[var(--err-bg)] text-[var(--err-fg)]';
  return 'bg-[var(--bg-subtle)] text-[var(--fg-muted)]';
};

export const StatusBadge = ({ status }: { status: number }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-[7px] py-[2px] rounded-full',
        'font-mono tabular-nums text-[10.5px] font-semibold',
        toneClass(status)
      )}
    >
      {status}
    </span>
  );
};
