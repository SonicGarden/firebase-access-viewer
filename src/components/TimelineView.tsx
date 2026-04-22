import { RequestRow } from '@/components/RequestRow';
import { EmptyState } from '@/components/EmptyState';
import type { Request } from '@/utils/requestHistory';

type TimelineViewProps = {
  requests: Request[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
};

export const TimelineView = ({ requests, expandedIds, onToggle }: TimelineViewProps) => {
  if (requests.length === 0) {
    return (
      <EmptyState
        title='No matching requests'
        subtitle='Try clearing the filter, or interact with the page to capture new Firestore / Storage traffic.'
      />
    );
  }
  return (
    <div>
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
