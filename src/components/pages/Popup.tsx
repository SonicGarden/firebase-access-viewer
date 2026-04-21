import { useState } from 'react';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { Button } from '@/components/Button';
import { SummaryBar } from '@/components/SummaryBar';
import { Tabs } from '@/components/Tabs';
import type { TabKey } from '@/components/Tabs';
import { FilterInput } from '@/components/FilterInput';
import { TimelineView } from '@/components/TimelineView';
import { GroupedView } from '@/components/GroupedView';
import { aggregateByPath } from '@/utils/aggregateByPath';
import { toggleInSet } from '@/utils/toggleInSet';

const TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'grouped', label: 'Grouped' },
];

const Popup = () => {
  const { requests, reset: resetRequests, reload } = useRequestsHistory();
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [filter, setFilter] = useState('');
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const reset = () => {
    setExpandedRequestIds(new Set());
    setExpandedPaths(new Set());
    resetRequests();
  };
  const toggleRequest = (id: string) => setExpandedRequestIds((prev) => toggleInSet(prev, id));
  const togglePath = (path: string) => setExpandedPaths((prev) => toggleInSet(prev, path));

  const needle = filter.trim().toLowerCase();
  const filteredRequests = needle
    ? requests.filter((r) => r.paths.toLowerCase().includes(needle))
    : requests;

  return (
    <div className='h-full p-3 flex flex-col gap-3 text-gray-900 dark:text-gray-100'>
      <div className='flex items-center justify-between gap-2'>
        <div className='text-base font-semibold'>Firebase access viewer</div>
        <div className='flex gap-1'>
          <Button onClick={reload}>Reload</Button>
          <Button onClick={reset}>Clear</Button>
        </div>
      </div>

      <SummaryBar requests={requests} />

      <FilterInput value={filter} onChange={setFilter} />

      <div className='flex-1 min-h-0 flex flex-col'>
        <Tabs items={TAB_ITEMS} active={activeTab} onChange={setActiveTab} />
        <div className='flex-1 min-h-0 overflow-auto rounded-b border border-t-0 border-gray-200 dark:border-gray-700'>
          {activeTab === 'timeline' ? (
            <TimelineView
              requests={filteredRequests}
              expandedIds={expandedRequestIds}
              onToggle={toggleRequest}
            />
          ) : (
            <GroupedView
              groups={aggregateByPath(filteredRequests)}
              expandedPaths={expandedPaths}
              onTogglePath={togglePath}
              expandedRequestIds={expandedRequestIds}
              onToggleRequest={toggleRequest}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
