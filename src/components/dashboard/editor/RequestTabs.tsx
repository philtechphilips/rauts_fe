'use client';

import { useDashboard } from '../DashboardContext';

const REQUEST_TABS = ['Params', 'Authorization', 'Headers', 'Body'] as const;

export function RequestTabs() {
  const { selectedEp, reqTab, setReqTab, rawBodyDraft } = useDashboard();
  if (!selectedEp) return null;

  return (
    <div
      className="flex min-h-0 shrink-0 items-center gap-0.5 overflow-x-auto border-b px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ background: '#222', borderColor: '#3A3A3A' }}
    >
      {REQUEST_TABS.map((tab) => {
        const badge =
          tab === 'Params'
            ? (selectedEp.params.length + selectedEp.query.length) || null
            : tab === 'Headers'
              ? selectedEp.headers.length || null
              : tab === 'Body' && rawBodyDraft.trim()
                ? 1
                : null;
        const active = reqTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setReqTab(tab)}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2 text-[12px] border-b-2 transition-colors"
            style={{
              color: active ? '#CFFE26' : 'rgba(255,255,255,0.38)',
              borderBottomColor: active ? '#CFFE26' : 'transparent',
            }}
          >
            {tab}
            {badge && (
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: active ? 'rgba(207,254,38,0.15)' : 'rgba(255,255,255,0.08)',
                  color: active ? '#CFFE26' : 'rgba(255,255,255,0.3)',
                }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
