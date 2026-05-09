'use client';

import { useDashboard } from './DashboardContext';

export function DashboardToast() {
  const { dashboardToast, dismissDashboardToast } = useDashboard();

  if (!dashboardToast) return null;

  const isError = dashboardToast.tone === 'error';

  return (
    <div
      className="fixed left-1/2 z-10040 max-w-[min(440px,calc(100vw-24px))] -translate-x-1/2 px-3 pointer-events-none"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl"
        style={{
          background: '#2a2a2a',
          borderColor: isError ? 'rgba(248,113,113,0.35)' : '#3A3A3A',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        }}
      >
        <p
          className="flex-1 text-[13px] leading-snug pt-0.5"
          style={{ color: isError ? 'rgba(254,202,202,0.95)' : 'rgba(255,255,255,0.88)' }}
        >
          {dashboardToast.message}
        </p>
        <button
          type="button"
          onClick={() => dismissDashboardToast()}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
