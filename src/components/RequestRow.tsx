import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { ServiceBadge } from '@/components/ServiceBadge';
import { JsonView } from '@/components/JsonView';
import { ExpandableRow } from '@/components/ExpandableRow';
import { PathPretty } from '@/components/PathPretty';
import type { Request } from '@/utils/requestHistory';

type RequestRowProps = {
  request: Request;
  expanded: boolean;
  onToggle: () => void;
};

const GRID_TEMPLATE = '68px 44px 84px 1fr auto 14px';
const COPY_FEEDBACK_MS = 1200;

const methodColorClass = (method: string) => {
  if (method === 'POST') return 'text-[var(--svc-firestore)]';
  if (method === 'GET') return 'text-[var(--svc-storage)]';
  if (method === 'DELETE') return 'text-[var(--err)]';
  if (method === 'PUT') return 'text-[var(--warn)]';
  return 'text-[var(--fg-muted)]';
};

const CopyJsonButton = ({ data }: { data: unknown }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async (e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (err) {
      console.warn('[firebase-access-viewer] copy failed', err);
    }
  };
  return (
    <button
      type='button'
      onClick={handleCopy}
      className={clsx(
        'ml-auto font-sans normal-case tracking-normal',
        'text-[11px] font-medium text-[var(--fg-muted)]',
        'px-[7px] py-[3px] rounded-[5px] bg-[var(--bg)] border border-[var(--line)]',
        'hover:text-[var(--fg)]'
      )}
    >
      {copied ? 'Copied' : 'Copy JSON'}
    </button>
  );
};

export const RequestRow = ({ request, expanded, onToggle }: RequestRowProps) => {
  const canExpand = request.rawQueries.length > 0;
  return (
    <ExpandableRow
      expanded={expanded}
      disabled={!canExpand}
      onToggle={onToggle}
      headerGridTemplate={GRID_TEMPLATE}
      rowHeight={30}
      header={
        <>
          <span className='font-mono tabular-nums text-[11px] text-[var(--fg-faint)]'>
            {request.requestedAt}
          </span>
          <span
            className={clsx(
              'font-mono tabular-nums text-[10.5px] font-semibold tracking-[0.02em]',
              methodColorClass(request.method)
            )}
          >
            {request.method}
          </span>
          <span className='min-w-0'>
            <ServiceBadge service={request.service} />
          </span>
          <span className='min-w-0 font-mono text-[12px] whitespace-nowrap overflow-hidden text-ellipsis'>
            <PathPretty path={request.paths} />
          </span>
          <span>
            <StatusBadge status={request.status} />
          </span>
        </>
      }
      body={
        <div
          className={clsx(
            'relative bg-[var(--bg-subtle)] px-[16px] pt-[10px] pb-[14px]',
            'border-t border-dashed border-[var(--line)]',
            "before:content-[''] before:absolute before:left-0 before:inset-y-0",
            'before:w-[2px] before:bg-[var(--accent)]'
          )}
        >
          <div className='flex items-center gap-2.5 mb-2 text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--fg-faint)]'>
            <span>Parsed query</span>
            <span className='text-[var(--fg-dim)]'>·</span>
            <span>
              {request.rawQueries.length} target
              {request.rawQueries.length > 1 ? 's' : ''}
            </span>
            <CopyJsonButton data={request.rawQueries} />
          </div>
          <JsonView data={request.rawQueries} />
        </div>
      }
    />
  );
};
