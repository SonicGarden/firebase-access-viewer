import clsx from 'clsx';
import type { FirebaseServiceName } from '@/utils';

const TONE_BY_SERVICE: Record<FirebaseServiceName, string> = {
  firestore: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  storage: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
};

const FALLBACK_TONE = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';

export const ServiceBadge = ({ service }: { service: FirebaseServiceName | '' }) => {
  const tone = service ? TONE_BY_SERVICE[service] : FALLBACK_TONE;
  return (
    <span className={clsx('inline-block px-1.5 py-0.5 rounded text-xs', tone)}>
      {service || '—'}
    </span>
  );
};
