import clsx from 'clsx';
import { ServiceBadge } from '@/components/ServiceBadge';
import { RequestRow } from '@/components/RequestRow';
import { ExpandableRow } from '@/components/ExpandableRow';
import type { PathAggregate } from '@/utils/aggregateByPath';

type GroupedViewProps = {
  groups: PathAggregate[];
  expandedPaths: Set<string>;
  onTogglePath: (path: string) => void;
  expandedRequestIds: Set<string>;
  onToggleRequest: (id: string) => void;
};

type GroupRowProps = {
  group: PathAggregate;
  expanded: boolean;
  onToggle: () => void;
  expandedRequestIds: Set<string>;
  onToggleRequest: (id: string) => void;
};

const GroupRow = ({
  group,
  expanded,
  onToggle,
  expandedRequestIds,
  onToggleRequest,
}: GroupRowProps) => {
  return (
    <ExpandableRow
      expanded={expanded}
      onToggle={onToggle}
      headerClassName={clsx(group.isNPlusOneSuspect && 'bg-amber-50 dark:bg-amber-900/20')}
      header={
        <>
          <span className='w-10 shrink-0 text-right font-mono tabular-nums text-xs text-gray-700 dark:text-gray-200'>
            {group.count}×
          </span>
          <span className='flex gap-1 shrink-0'>
            {group.services.map((s) => (
              <ServiceBadge key={s} service={s} />
            ))}
          </span>
          <span className='flex-1 min-w-0 truncate text-gray-900 dark:text-gray-100'>{group.path}</span>
          {group.isNPlusOneSuspect && (
            <span className='shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100'>
              N+1?
            </span>
          )}
          {group.errorCount > 0 && (
            <span className='shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
              {group.errorCount} err
            </span>
          )}
        </>
      }
      body={
        <div className='border-t border-gray-100 dark:border-gray-800'>
          {group.requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              expanded={expandedRequestIds.has(request.id)}
              onToggle={() => onToggleRequest(request.id)}
            />
          ))}
        </div>
      }
    />
  );
};

export const GroupedView = ({
  groups,
  expandedPaths,
  onTogglePath,
  expandedRequestIds,
  onToggleRequest,
}: GroupedViewProps) => {
  if (groups.length === 0) {
    return (
      <div className='px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400'>
        No paths to group.
      </div>
    );
  }
  return (
    <div>
      {groups.map((group) => (
        <GroupRow
          key={group.path}
          group={group}
          expanded={expandedPaths.has(group.path)}
          onToggle={() => onTogglePath(group.path)}
          expandedRequestIds={expandedRequestIds}
          onToggleRequest={onToggleRequest}
        />
      ))}
    </div>
  );
};
