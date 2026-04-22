import { useEffect, useRef, useState } from 'react';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { Button } from '@/components/Button';
import { SummaryBar } from '@/components/SummaryBar';
import { Tabs } from '@/components/Tabs';
import type { TabKey } from '@/components/Tabs';
import { FilterInput } from '@/components/FilterInput';
import { TimelineView } from '@/components/TimelineView';
import { GroupedView } from '@/components/GroupedView';
import { FlameIcon, ReloadIcon, TrashIcon } from '@/components/Icons';
import { aggregateByPath } from '@/utils/aggregateByPath';
import { toggleInSet } from '@/utils/toggleInSet';

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
};

const MANIFEST_VERSION = (() => {
  try {
    return chrome?.runtime?.getManifest?.().version ?? '1.2.0';
  } catch {
    return '1.2.0';
  }
})();

const Popup = () => {
  const { requests, reset: resetRequests, reload } = useRequestsHistory();
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [filter, setFilter] = useState('');
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLInputElement>(null);

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
  const groups = aggregateByPath(filteredRequests);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      filterRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const tabItems = [
    { key: 'timeline' as TabKey, label: 'Timeline', count: filteredRequests.length },
    { key: 'grouped' as TabKey, label: 'Grouped', count: groups.length },
  ];

  return (
    <div className='h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]'>
      <header className='flex items-center gap-2.5 px-[14px] py-[10px] border-b border-[var(--line-soft)]'>
        <div className='flex items-center gap-[9px] min-w-0'>
          <div
            aria-hidden='true'
            className='relative flex items-center justify-center w-[22px] h-[22px] rounded-md'
            style={{
              background: 'linear-gradient(155deg, oklch(78% 0.16 70), oklch(64% 0.18 40))',
              boxShadow:
                'inset 0 0 0 1px oklch(100% 0 0 / 0.3), 0 1px 2px oklch(0% 0 0 / 0.1)',
            }}
          >
            <FlameIcon className='w-[13px] h-[13px] text-white/95' />
          </div>
          <div className='text-[13px] font-semibold tracking-[-0.005em] text-[var(--fg)]'>
            Firebase access viewer
          </div>
        </div>
        <div className='ml-auto flex items-center gap-1.5'>
          <Button onClick={reload} icon={<ReloadIcon />} title='Reload' ariaLabel='Reload'>
            Reload
          </Button>
          <Button onClick={reset} icon={<TrashIcon />} danger title='Clear' ariaLabel='Clear'>
            Clear
          </Button>
        </div>
      </header>

      <SummaryBar requests={requests} />

      <div
        className='grid items-center gap-4 px-[14px] py-[10px] border-b border-[var(--line-soft)]'
        style={{ gridTemplateColumns: 'auto 1fr' }}
      >
        <Tabs items={tabItems} active={activeTab} onChange={setActiveTab} />
        <FilterInput ref={filterRef} value={filter} onChange={setFilter} />
      </div>

      <div className='fav-scroll flex-1 min-h-0 overflow-auto'>
        {activeTab === 'timeline' ? (
          <TimelineView
            requests={filteredRequests}
            expandedIds={expandedRequestIds}
            onToggle={toggleRequest}
          />
        ) : (
          <GroupedView
            groups={groups}
            expandedPaths={expandedPaths}
            onTogglePath={togglePath}
            expandedRequestIds={expandedRequestIds}
            onToggleRequest={toggleRequest}
          />
        )}
      </div>

      <footer className='flex items-center gap-2.5 px-[14px] py-2 border-t border-[var(--line-soft)] bg-[var(--bg-elev)] text-[11px] text-[var(--fg-faint)] font-mono'>
        <span className='inline-flex items-center gap-[5px] font-sans font-medium text-[var(--ok-fg)]'>
          <span
            aria-hidden='true'
            className='w-[6px] h-[6px] rounded-full bg-[var(--ok)]'
            style={{ animation: 'pulse 1.6s infinite' }}
          />
          Listening
        </span>
        <span className='ml-auto flex items-center gap-3.5'>
          <span className='inline-flex items-center gap-1'>
            <kbd className='font-mono text-[10px] px-1 rounded-[3px] bg-[var(--bg-subtle)] text-[var(--fg-muted)] border border-[var(--line)]'>
              /
            </kbd>
            filter
          </span>
          <span className='inline-flex items-center gap-1'>
            <kbd className='font-mono text-[10px] px-1 rounded-[3px] bg-[var(--bg-subtle)] text-[var(--fg-muted)] border border-[var(--line)]'>
              ↵
            </kbd>
            expand
          </span>
          <span>v{MANIFEST_VERSION}</span>
        </span>
      </footer>
    </div>
  );
};

export default Popup;
