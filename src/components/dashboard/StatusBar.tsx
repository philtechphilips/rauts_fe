'use client';

import { useDashboard } from './DashboardContext';
import { MethodBadge } from './MethodBadge';
import { IconConsole } from './icons';

export function StatusBar() {
  const { selectedCol, selectedEp, pathDraft } = useDashboard();

  return (
    <footer
      className="flex h-auto min-h-6 shrink-0 items-center gap-2 sm:gap-3 overflow-x-auto border-t px-2 py-1 sm:h-6 sm:py-0 sm:px-3 flex-nowrap"
      style={{ background: '#252525', borderColor: '#3A3A3A' }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#49CC90' }} />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Connected</span>
      </div>
      <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
        {selectedCol?.name ?? 'No collection selected'}
      </span>
      {selectedEp && (
        <>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <MethodBadge method={selectedEp.method} />
          <span className="text-[11px] font-mono truncate max-w-[min(200px,45vw)] sm:max-w-none" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {pathDraft}
          </span>
        </>
      )}
      <div className="flex-1" />
      <button
        className="hidden sm:flex items-center gap-1 text-[11px] transition-colors hover:text-white/50 shrink-0"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <IconConsole />
        Console
      </button>
      <div className="hidden sm:block w-px h-3 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <span className="hidden sm:inline text-[11px] shrink-0" style={{ color: 'rgba(255,255,255,0.12)' }}>v1.0.0</span>
    </footer>
  );
}
