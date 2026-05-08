'use client';

import { useDashboard } from './DashboardContext';
import {
  IconCollections,
  IconEnvironment,
  IconGitHub,
  IconHistory,
  IconLogout,
  IconSettings,
} from './icons';
import type { SidebarTab } from '@/hooks/dashboard/useDashboardState';

const RAIL_TABS: { tab: SidebarTab; Icon: () => React.JSX.Element }[] = [
  { tab: 'Collections', Icon: IconCollections },
  { tab: 'Environment', Icon: IconEnvironment },
  { tab: 'History', Icon: IconHistory },
  { tab: 'GitHub', Icon: IconGitHub },
];

export function IconRail() {
  const { sidebarTab, setSidebarTab, logout, router } = useDashboard();

  return (
    <aside
      className="w-11 flex flex-col items-center py-2 gap-1 shrink-0 border-r"
      style={{ background: '#242424', borderColor: '#3A3A3A' }}
    >
      {RAIL_TABS.map(({ tab, Icon }) => (
        <button
          key={tab}
          onClick={() => setSidebarTab(tab)}
          title={tab}
          className="w-9 h-9 flex items-center justify-center rounded transition-colors relative group/rail"
          style={{
            background: sidebarTab === tab ? 'rgba(207,254,38,0.1)' : 'transparent',
            color: sidebarTab === tab ? '#CFFE26' : 'rgba(255,255,255,0.3)',
          }}
        >
          <Icon />
          <span
            className="absolute left-11 px-2 py-1 rounded text-[11px] whitespace-nowrap z-50
              opacity-0 group-hover/rail:opacity-100 pointer-events-none transition-opacity shadow-xl"
            style={{
              background: '#2C2C2C',
              border: '1px solid #3E3E3E',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {tab}
          </span>
        </button>
      ))}

      <div className="mt-auto pb-2">
        <button
          title="Settings"
          className="w-9 h-9 flex items-center justify-center rounded transition-colors hover:bg-white/8"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <IconSettings />
        </button>
        <button
          type="button"
          title="Sign Out"
          onClick={() => {
            logout();
            router.replace('/auth/login');
          }}
          className="w-9 h-9 flex items-center justify-center rounded transition-colors hover:bg-red-400/10"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <IconLogout />
        </button>
      </div>
    </aside>
  );
}
