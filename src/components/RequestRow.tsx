import { StatusBadge } from '@/components/StatusBadge';
import { ServiceBadge } from '@/components/ServiceBadge';
import { JsonView } from '@/components/JsonView';
import { ExpandableRow } from '@/components/ExpandableRow';
import type { Request } from '@/utils/requestHistory';

type RequestRowProps = {
  request: Request;
  expanded: boolean;
  onToggle: () => void;
};

export const RequestRow = ({ request, expanded, onToggle }: RequestRowProps) => {
  const canExpand = request.rawQueries.length > 0;
  return (
    <ExpandableRow
      expanded={expanded}
      disabled={!canExpand}
      onToggle={onToggle}
      header={
        <>
          <span className='w-16 shrink-0 font-mono tabular-nums text-xs text-gray-600 dark:text-gray-400'>
            {request.requestedAt}
          </span>
          <span className='w-14 shrink-0 font-mono text-xs text-gray-600 dark:text-gray-400'>
            {request.method}
          </span>
          <span className='w-20 shrink-0'>
            <ServiceBadge service={request.service} />
          </span>
          <span className='flex-1 min-w-0 truncate text-gray-900 dark:text-gray-100'>
            {request.paths || <span className='text-gray-400 dark:text-gray-500'>(no path)</span>}
          </span>
          <span className='shrink-0'>
            <StatusBadge status={request.status} />
          </span>
        </>
      }
      body={
        <div className='px-3 py-2 bg-gray-50 dark:bg-gray-900 overflow-auto'>
          <JsonView data={request.rawQueries} />
        </div>
      }
    />
  );
};
