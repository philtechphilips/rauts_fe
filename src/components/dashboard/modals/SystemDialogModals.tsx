'use client';

import { useEffect } from 'react';
import { useDashboard } from '../DashboardContext';

export function SystemDialogModals() {
  const {
    systemAlert,
    dismissSystemAlert,
    systemConfirm,
    resolveSystemConfirm,
  } = useDashboard();

  useEffect(() => {
    if (!systemAlert && !systemConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (systemConfirm) resolveSystemConfirm(false);
      else dismissSystemAlert();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [systemAlert, systemConfirm, dismissSystemAlert, resolveSystemConfirm]);

  return (
    <>
      {systemAlert && (
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-alert-title"
          onClick={() => dismissSystemAlert()}
        >
          <div
            className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="system-alert-title" className="text-lg font-semibold text-white mb-2">
              {systemAlert.title}
            </h2>
            <p
              className="text-[13px] leading-relaxed mb-6 whitespace-pre-wrap"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {systemAlert.message}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => dismissSystemAlert()}
                className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {systemConfirm && (
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-confirm-title"
          onClick={() => resolveSystemConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="system-confirm-title" className="text-lg font-semibold text-white mb-2">
              {systemConfirm.title}
            </h2>
            <p
              className="text-[13px] leading-relaxed mb-6 whitespace-pre-wrap"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              {systemConfirm.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => resolveSystemConfirm(false)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resolveSystemConfirm(true)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-50 hover:bg-white/5"
                style={
                  systemConfirm.destructive
                    ? {
                        borderColor: 'rgba(248,113,113,0.45)',
                        background: 'rgba(248,113,113,0.12)',
                        color: 'rgba(252,165,165,0.95)',
                      }
                    : {
                        borderColor: '#3A3A3A',
                        color: 'rgba(255,255,255,0.85)',
                      }
                }
              >
                {systemConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
