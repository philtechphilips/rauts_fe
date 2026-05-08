'use client';

import { useDashboard } from '../DashboardContext';
import { MethodBadge } from '../MethodBadge';
import { IconClose } from '../icons';

export function TabBar() {
  const { openTabs, allEndpoints, selectedEpId, setSelectedEpId, setScenarioIdx, closeTab } =
    useDashboard();

  return (
    <div
      className="flex h-9 shrink-0 items-end gap-0.5 overflow-x-auto border-b px-2"
      style={{ background: '#222', borderColor: '#3A3A3A' }}
    >
      {openTabs.map((tid) => {
        const ep = allEndpoints.find((e) => e.id === tid);
        if (!ep) return null;
        const active = selectedEpId === tid;
        return (
          <button
            key={tid}
            onClick={() => {
              setSelectedEpId(tid);
              setScenarioIdx(0);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-t border-t-2 border-x shrink-0 transition-colors"
            style={{
              background: active ? '#1A1A1A' : 'transparent',
              borderTopColor: active ? '#CFFE26' : 'transparent',
              borderLeftColor: active ? '#3A3A3A' : 'transparent',
              borderRightColor: active ? '#3A3A3A' : 'transparent',
              color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
            }}
          >
            <MethodBadge method={ep.method} />
            <span className="text-[12px] max-w-35 truncate">{ep.name}</span>
            {active && (
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0 -mx-0.5"
                style={{ background: '#CFFE26', opacity: 0.6 }}
              />
            )}
            <span
              onClick={(e) => closeTab(tid, e)}
              className="ml-0.5 flex items-center justify-center w-4 h-4 rounded hover:bg-white/15 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <IconClose size={9} strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
