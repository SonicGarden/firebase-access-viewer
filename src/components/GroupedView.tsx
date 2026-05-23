import clsx from 'clsx';
import { ServiceBadge } from '@/components/ServiceBadge';
import { RequestRow } from '@/components/RequestRow';
import { ExpandableRow } from '@/components/ExpandableRow';
import { PathPretty } from '@/components/PathPretty';
import { EmptyState } from '@/components/EmptyState';
import { WarnIcon } from '@/components/Icons';
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

const GRID_TEMPLATE = '44px 1fr auto auto 14px';

const BADGE_BASE =
  'inline-flex items-center gap-1 px-[7px] py-[2px] rounded-full text-[10px] font-semibold uppercase tracking-[0.04em]';

const GroupRow = ({
  group,
  expanded,
  onToggle,
  expandedRequestIds,
  onToggleRequest,
}: GroupRowProps) => {
  const showWash = group.isNPlusOneSuspect && !expanded;
  return (
    <ExpandableRow
      expanded={expanded}
      onToggle={onToggle}
      headerGridTemplate={GRID_TEMPLATE}
      rowHeight={34}
      headerClassName={clsx(showWash && 'n1-wash')}
      header={
        <>
          <span className='flex items-baseline justify-end gap-px font-mono tabular-nums text-[var(--fg)]'>
            <span className='text-[15px] font-semibold'>{group.count}</span>
            <span className='text-[10px] text-[var(--fg-faint)] pl-px'>×</span>
          </span>
          <span className='min-w-0 font-mono text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis'>
            <PathPretty path={group.path} />
          </span>
          <span className='flex gap-1'>
            {group.services.map((s) => (
              <ServiceBadge key={s} service={s} />
            ))}
          </span>
          <span className='flex gap-1.5'>
            {group.isNPlusOneSuspect && (
              <span className={clsx(BADGE_BASE, 'bg-[var(--warn-bg)] text-[var(--warn-fg)]')}>
                <WarnIcon className='w-[9px] h-[9px]' />
                N+1?
              </span>
            )}
            {group.errorCount > 0 && (
              <span className={clsx(BADGE_BASE, 'bg-[var(--err-bg)] text-[var(--err-fg)]')}>
                <span className='font-mono text-[10.5px]'>{group.errorCount}</span>
                err
              </span>
            )}
          </span>
        </>
      }
      body={
        <div className='group-children bg-[var(--bg-subtle)]'>
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
      <EmptyState
        title='Nothing to group yet'
        subtitle='Groups show once requests share a path. Keep the page active to accumulate traffic.'
      />
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
