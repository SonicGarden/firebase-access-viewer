import { RequestRow } from '@/components/RequestRow';
import type { Request } from '@/utils/requestHistory';

type TimelineViewProps = {
  requests: Request[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
};

export const TimelineView = ({ requests, expandedIds, onToggle }: TimelineViewProps) => {
  if (requests.length === 0) {
    return (
      <div className='px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400'>
        No matching requests.
      </div>
    );
  }
  return (
    <div className='divide-y divide-transparent'>
      {requests.map((request) => (
        <RequestRow
          key={request.id}
          request={request}
          expanded={expandedIds.has(request.id)}
          onToggle={() => onToggle(request.id)}
        />
      ))}
    </div>
  );
};
