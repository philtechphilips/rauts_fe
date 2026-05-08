'use client';

import { useDashboard } from '../DashboardContext';
import { CollectionsPanel } from './CollectionsPanel';
import { EnvironmentPanel } from './EnvironmentPanel';
import { GithubPanel } from './GithubPanel';
import { HistoryPanel } from './HistoryPanel';

export function Sidebar() {
  const { sidebarTab } = useDashboard();
  return (
    <div
      className="flex w-[min(260px,calc(100vw-2.75rem-12px))] shrink-0 flex-col overflow-hidden border-r md:w-[260px]"
      style={{ background: '#232323', borderColor: '#3A3A3A' }}
    >
      {sidebarTab === 'Collections' && <CollectionsPanel />}
      {sidebarTab === 'Environment' && <EnvironmentPanel />}
      {sidebarTab === 'History' && <HistoryPanel />}
      {sidebarTab === 'GitHub' && <GithubPanel />}
    </div>
  );
}
