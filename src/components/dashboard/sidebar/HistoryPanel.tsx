'use client';

import React, { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '../DashboardContext';
import { ClearHistoryModal } from '../modals/ClearHistoryModal';
import { MethodBadge } from '../MethodBadge';
import { IconCopy } from '../icons';
import {
  formatHistoryRelativeTime,
  historyDayLabel,
  type DashboardHistoryEntry,
} from '@/lib/dashboard/request-history';

function groupHistoryByDay(entries: DashboardHistoryEntry[]): { label: string; items: DashboardHistoryEntry[] }[] {
  const out: { label: string; items: DashboardHistoryEntry[] }[] = [];
  const indexByLabel = new Map<string, number>();
  for (const e of entries) {
    const label = historyDayLabel(e.at);
    let idx = indexByLabel.get(label);
    if (idx === undefined) {
      idx = out.length;
      indexByLabel.set(label, idx);
      out.push({ label, items: [] });
    }
    out[idx]!.items.push(e);
  }
  return out;
}

export function HistoryPanel() {
  const user = useAuthStore((s) => s.user);
  const { requestHistory, clearRequestHistory, replayHistoryEntry } = useDashboard();
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);

  const grouped = useMemo(() => groupHistoryByDay(requestHistory), [requestHistory]);

  const statusDisplay = (h: DashboardHistoryEntry) => {
    if (h.error === 'network' && h.status === 0) {
      return h.statusText?.slice(0, 14) || 'Error';
    }
    return String(h.status);
  };

  const statusColor = (h: DashboardHistoryEntry) => {
    if (h.error) return '#F93E3E';
    return h.ok ? '#49CC90' : '#F93E3E';
  };

  return (
    <>
    <ClearHistoryModal
      open={clearHistoryOpen}
      accountBacked={Boolean(user?.id)}
      onCancel={() => setClearHistoryOpen(false)}
      onConfirm={() => {
        clearRequestHistory();
        setClearHistoryOpen(false);
      }}
    />
    <div className="flex flex-col h-full select-none">
      <div
        className="flex items-center px-3 h-9 shrink-0 border-b justify-between"
        style={{ borderColor: '#3A3A3A' }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          History
        </span>
        <button
          type="button"
          disabled={requestHistory.length === 0}
          className="text-[11px] hover:underline disabled:opacity-25 disabled:no-underline"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onClick={() => {
            if (requestHistory.length === 0) return;
            setClearHistoryOpen(true);
          }}
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {requestHistory.length === 0 ? (
          <p className="text-[11px] px-2 py-6 text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {user?.id
              ? 'Send requests from the editor — each call is saved to your account. Click an entry to reopen that request.'
              : 'Send requests from the editor — each call is saved on this device. Click an entry to reopen that request.'}
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-[10px] mb-1.5 px-1 font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {group.label}
              </p>
              {group.items.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg border mb-1 overflow-hidden transition-colors group"
                  style={{ borderColor: '#333', background: 'transparent' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div className="flex items-start gap-0.5 px-2 py-2">
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left flex flex-col gap-0.5 outline-none focus-visible:ring-1 focus-visible:ring-[#CFFE26]/40 rounded"
                      title={`${h.resolvedUrl}\nClick to reopen this request`}
                      onClick={() => replayHistoryEntry(h)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MethodBadge method={h.method} />
                        <span
                          className="flex-1 text-[11px] font-mono truncate"
                          style={{ color: 'rgba(255,255,255,0.62)' }}
                        >
                          {h.pathDraft || '/'}
                        </span>
                        <span className="text-[10px] shrink-0 font-semibold tabular-nums" style={{ color: statusColor(h) }}>
                          {statusDisplay(h)}
                        </span>
                        <span className="text-[10px] shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {h.ms}ms
                        </span>
                        <span className="text-[10px] shrink-0 w-8 text-right" style={{ color: 'rgba(255,255,255,0.18)' }}>
                          {formatHistoryRelativeTime(h.at)}
                        </span>
                      </div>
                      {(h.endpointName || h.resolvedUrl) && (
                        <div className="flex items-center gap-2 pl-[52px] min-w-0">
                          <span className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {h.endpointName ? `${h.endpointName} · ` : ''}
                            <span className="font-mono">{h.resolvedUrl}</span>
                          </span>
                        </div>
                      )}
                    </button>
                    <button
                      type="button"
                      className="shrink-0 p-1 rounded mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 outline-none focus-visible:ring-1 focus-visible:ring-[#CFFE26]/40"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      title="Copy resolved URL"
                      onClick={() => {
                        void navigator.clipboard?.writeText(h.resolvedUrl);
                      }}
                    >
                      <IconCopy />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
