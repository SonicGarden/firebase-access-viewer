import { InboxIcon } from '@/components/Icons';

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export const EmptyState = ({ title, subtitle }: EmptyStateProps) => {
  return (
    <div className='flex flex-col items-center gap-[14px] px-6 py-16 text-center'>
      <div className='flex items-center justify-center w-14 h-14 rounded-[14px] bg-[var(--bg-subtle)] border border-dashed border-[var(--line-strong)]'>
        <InboxIcon className='w-6 h-6 text-[var(--fg-dim)]' />
      </div>
      <h3 className='m-0 text-sm font-semibold text-[var(--fg)]'>{title}</h3>
      <p className='m-0 max-w-80 text-[12.5px] text-[var(--fg-muted)]'>{subtitle}</p>
    </div>
  );
};
