'use client';

import { useDashboard } from './DashboardContext';

export function LoadingOverlay() {
  const { listReady, loadError } = useDashboard();

  if (!loadError && !listReady) {
    return (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(26,26,26,0.94)' }}
      >
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Loading workspace…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ background: '#1A1A1A' }}
      >
        <p className="text-[13px] max-w-md" style={{ color: 'rgba(249,62,62,0.9)' }}>
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-[12px] font-semibold underline"
          style={{ color: '#CFFE26' }}
        >
          Reload
        </button>
      </div>
    );
  }

  return null;
}
