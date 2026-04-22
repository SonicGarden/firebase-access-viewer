import clsx from 'clsx';
import type { FirebaseServiceName } from '@/utils';

const TONE_BY_SERVICE: Record<
  FirebaseServiceName,
  { bg: string; dot: string }
> = {
  firestore: {
    bg: 'bg-[var(--svc-firestore-bg)] text-[var(--svc-firestore-fg)]',
    dot: 'bg-[var(--svc-firestore)]',
  },
  storage: {
    bg: 'bg-[var(--svc-storage-bg)] text-[var(--svc-storage-fg)]',
    dot: 'bg-[var(--svc-storage)]',
  },
};

const FALLBACK_TONE = {
  bg: 'bg-[var(--bg-subtle)] text-[var(--fg-faint)]',
  dot: 'bg-[var(--fg-dim)]',
};

export const ServiceBadge = ({ service }: { service: FirebaseServiceName | '' }) => {
  const tone = service ? TONE_BY_SERVICE[service] : FALLBACK_TONE;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-[5px] pl-[6px] pr-[7px] py-[2px] rounded-full',
        'text-[10.5px] font-medium',
        tone.bg
      )}
    >
      <span
        aria-hidden='true'
        className={clsx('w-[5px] h-[5px] rounded-full', tone.dot)}
      />
      {service || '—'}
    </span>
  );
};
