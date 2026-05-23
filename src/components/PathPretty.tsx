import { splitPathSegments } from '@/utils/pathSegments';

const SEG_CLASS = {
  collection: 'text-[var(--fg)]',
  id: 'text-[var(--fg-muted)]',
  slash: 'text-[var(--fg-dim)] px-px',
} as const;

export const PathPretty = ({ path }: { path: string }) => {
  if (!path) {
    return (
      <span className='italic text-[var(--fg-dim)] font-sans'>(no path)</span>
    );
  }
  return (
    <>
      {splitPathSegments(path).map((segment, i) => (
        <span key={i} className={SEG_CLASS[segment.role]}>
          {segment.text}
        </span>
      ))}
    </>
  );
};
