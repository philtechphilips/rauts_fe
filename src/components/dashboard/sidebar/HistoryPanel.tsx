'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
import { fetchBackendRequestHistory } from '@/lib/dashboard/request-history-api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Pagination states for actual on-scroll backend-driven pagination
  const [loadedEntries, setLoadedEntries] = useState<DashboardHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Initial load or refresh when global context count changes
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      // Local session - load local request history from context
      setLoadedEntries(requestHistory);
      setHasMore(false);
      return;
    }

    // Authenticated session - fetch first page from backend
    void (async () => {
      setLoading(true);
      try {
        const entries = await fetchBackendRequestHistory(15, 0);
        if (cancelled) return;
        setLoadedEntries(entries);
        setHasMore(entries.length === 15);
      } catch (e) {
        console.error('Error fetching request history:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, requestHistory.length]);

  // Load more function when scroll threshold is hit
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !user?.id) return;
    setLoading(true);
    try {
      const offset = loadedEntries.length;
      const entries = await fetchBackendRequestHistory(15, offset);
      setLoadedEntries((prev) => {
        // Prevent duplicate IDs
        const existingIds = new Set(prev.map((e) => e.id));
        const unique = entries.filter((e) => !existingIds.has(e.id));
        return [...prev, ...unique];
      });
      setHasMore(entries.length === 15);
    } catch (e) {
      console.error('Error loading more request history:', e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, user?.id, loadedEntries.length]);

  // Set up IntersectionObserver for scroll tracking
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Add a tiny premium micro-delay so the spinning loader is visible briefly
          setTimeout(() => {
            void loadMore();
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  // Filter history by search query (method, path, resolved URL, or endpoint name)
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return loadedEntries;
    const query = searchQuery.toLowerCase().trim();
    return loadedEntries.filter(
      (h) =>
        h.method.toLowerCase().includes(query) ||
        h.pathDraft.toLowerCase().includes(query) ||
        h.resolvedUrl.toLowerCase().includes(query) ||
        (h.endpointName && h.endpointName.toLowerCase().includes(query))
    );
  }, [loadedEntries, searchQuery]);

  const grouped = useMemo(() => groupHistoryByDay(filteredHistory), [filteredHistory]);

  // Find currently selected history entry
  const selectedEntry = useMemo(() => {
    return loadedEntries.find((h) => h.id === selectedEntryId) || requestHistory.find((h) => h.id === selectedEntryId) || null;
  }, [loadedEntries, requestHistory, selectedEntryId]);

  // Select the first history item by default if none is selected
  useEffect(() => {
    if (loadedEntries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(loadedEntries[0].id);
    }
  }, [loadedEntries, selectedEntryId]);

  const statusDisplay = (h: DashboardHistoryEntry) => {
    if (h.error === 'network' && h.status === 0) {
      return h.statusText?.slice(0, 14) || 'Error';
    }
    return String(h.status);
  };

  const statusColor = (h: DashboardHistoryEntry) => {
    if (h.error) return '#F93E3E';
    return h.ok ? '#10B981' : '#F93E3E';
  };

  return (
    <>
      <ClearHistoryModal
        open={clearHistoryOpen}
        accountBacked={Boolean(user?.id)}
        onCancel={() => setClearHistoryOpen(false)}
        onConfirm={() => {
          clearRequestHistory();
          setSelectedEntryId(null);
          setClearHistoryOpen(false);
        }}
      />
      
      <div className="flex h-full w-full overflow-hidden text-white" style={{ background: '#141414' }}>
        {/* LEFT COLUMN: History Logs list */}
        <div
          className="w-96 h-full border-r flex flex-col shrink-0"
          style={{ borderColor: '#262626', background: '#1A1A1A' }}
        >
          {/* Header */}
          <div
            className="flex items-center px-6 h-16 shrink-0 border-b justify-between"
            style={{ borderColor: '#262626' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-white/50">
                Request Logs
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-white/70">
                {requestHistory.length}
              </span>
            </div>
            <button
              type="button"
              disabled={requestHistory.length === 0}
              className="text-[11px] font-bold hover:underline disabled:opacity-20 disabled:no-underline text-red-400"
              onClick={() => {
                if (requestHistory.length === 0) return;
                setClearHistoryOpen(true);
              }}
            >
              Clear
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-2.5 border-b shrink-0" style={{ borderColor: '#262626' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter logs by url, method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-[11.5px] outline-none transition-all focus:border-white/20"
                style={{ background: '#141414', borderColor: '#262626', color: '#FFF' }}
              />
              <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Grouped Logs List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {requestHistory.length === 0 ? (
              <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="text-[12px] text-white/40 leading-relaxed max-w-[200px]">
                  Send requests from the workspace — each call is automatically saved.
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[12px] text-white/40 leading-relaxed max-w-[200px]">
                  No matches found for &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="text-[10px] px-2.5 py-1.5 font-bold uppercase tracking-wider text-white/30">
                    {group.label}
                  </p>
                  {group.items.map((h) => {
                    const active = h.id === selectedEntryId;
                    const isSuccess = h.ok && !h.error;
                    return (
                      <div
                        key={h.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedEntryId(h.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedEntryId(h.id);
                          }
                        }}
                        className="rounded-xl border p-3 cursor-pointer transition-all duration-200 group relative overflow-hidden"
                        style={{
                          borderColor: active ? 'rgba(207,254,38,0.3)' : 'transparent',
                          background: active ? 'rgba(207,254,38,0.06)' : 'transparent',
                          boxShadow: active ? '0 4px 20px rgba(207,254,38,0.03)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {/* Selected accent indicator */}
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#CFFE26]" />
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MethodBadge method={h.method} />
                            <span
                              className="text-[12px] font-mono font-medium truncate"
                              style={{ color: active ? '#FFF' : 'rgba(255,255,255,0.7)' }}
                            >
                              {h.pathDraft || '/'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span 
                              className="text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded-md" 
                              style={{ 
                                color: isSuccess ? '#10B981' : '#EF4444',
                                background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              }}
                            >
                              {statusDisplay(h)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pl-[54px] text-[10px] text-white/30 font-medium">
                          <span className="truncate pr-2 group-hover:text-white/50 transition-colors">
                            {h.endpointName || 'Unmapped request'}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] text-white/20">
                            {formatHistoryRelativeTime(h.at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}

            {/* Infinite Scroll target observer */}
            {hasMore && (
              <div ref={observerTarget} className="py-4 flex items-center justify-center gap-2 shrink-0">
                <svg className="animate-spin h-4 w-4 text-[#CFFE26]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase">Loading older logs...</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Details Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden p-8 lg:p-12">
          {!selectedEntry ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5 border border-white/10 text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-white mb-1.5">No Log Selected</h2>
              <p className="text-xs text-white/40 leading-relaxed">
                Choose a request log from the list on the left to review its detailed parameters, status codes, and execution timings.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Top Banner Row */}
              <div className="shrink-0 flex items-start justify-between pb-5 border-b border-[#262626]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <MethodBadge method={selectedEntry.method} size="md" />
                    <h1 className="text-2xl font-mono font-bold tracking-tight text-white truncate max-w-full">
                      {selectedEntry.pathDraft || '/'}
                    </h1>
                  </div>
                  <p className="mt-2.5 text-sm font-mono text-white/40 break-all select-all flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CFFE26] shrink-0" />
                    {selectedEntry.resolvedUrl}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => replayHistoryEntry(selectedEntry)}
                    className="px-5 py-2 rounded-lg text-[12px] font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(207,254,38,0.12)]"
                    style={{ background: '#CFFE26' }}
                  >
                    Open in Workspace
                  </button>
                  <button
                    type="button"
                    title="Copy Full URL"
                    onClick={() => {
                      void navigator.clipboard?.writeText(selectedEntry.resolvedUrl);
                    }}
                    className="p-2 rounded-lg border text-white/60 hover:text-white transition-all hover:bg-white/5 active:scale-95"
                    style={{ borderColor: '#2E2E2E' }}
                  >
                    <IconCopy />
                  </button>
                </div>
              </div>

              {/* Grid Dashboard */}
              <div className="flex-1 overflow-y-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
                {/* TIMINGS & STATUS CARD */}
                <div className="border rounded-xl p-4 space-y-3.5" style={{ background: '#1A1A1A', borderColor: '#262626' }}>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Execution Metadata
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#141414] rounded-lg border border-[#2D2D2D] relative overflow-hidden group">
                      <span className="block text-[9px] text-white/30 font-bold uppercase tracking-wider">Status</span>
                      <span className="block text-xl font-mono font-bold mt-0.5" style={{ color: statusColor(selectedEntry) }}>
                        {statusDisplay(selectedEntry)}
                      </span>
                      <span className="text-[9px] text-white/30 font-mono mt-0.5 block truncate">
                        {selectedEntry.statusText || (selectedEntry.ok ? 'OK' : 'Error')}
                      </span>
                    </div>

                    <div className="p-3 bg-[#141414] rounded-lg border border-[#2D2D2D] relative overflow-hidden group">
                      <span className="block text-[9px] text-white/30 font-bold uppercase tracking-wider">Duration</span>
                      <span className="block text-xl font-mono font-bold mt-0.5 text-white/80">
                        {selectedEntry.ms} <span className="text-xs text-white/40">ms</span>
                      </span>
                      <span className={`text-[9px] font-bold mt-0.5 block uppercase ${
                        selectedEntry.ms < 200 ? 'text-green-400' : selectedEntry.ms < 800 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {selectedEntry.ms < 200 ? 'Ultra Fast' : selectedEntry.ms < 800 ? 'Normal' : 'Slow Response'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5">
                      <span className="text-white/40 font-semibold text-[11px]">Exact Timestamp</span>
                      <span className="font-mono text-white/70 text-[11px]">
                        {new Date(selectedEntry.at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5">
                      <span className="text-white/40 font-semibold text-[11px]">Endpoint Name</span>
                      <span className="text-white/70 font-semibold text-[11px] truncate max-w-[150px]">
                        {selectedEntry.endpointName || 'Unmapped endpoint'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-0.5">
                      <span className="text-white/40 font-semibold text-[11px]">Storage Type</span>
                      <span className="text-[#CFFE26]/80 font-bold text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CFFE26] shrink-0" />
                        {user?.id ? 'Cloud Backed Sync' : 'Device Local Storage'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HELP CARD */}
                <div 
                  className="border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden" 
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(207,254,38,0.03) 0%, rgba(207,254,38,0.0) 100%)', 
                    borderColor: 'rgba(207,254,38,0.1)' 
                  }}
                >
                  <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#CFFE26]/5 blur-2xl pointer-events-none" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#CFFE26]/10 flex items-center justify-center text-[#CFFE26]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
                        </svg>
                      </div>
                      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                        Replay & Sync Workspace
                      </h3>
                    </div>

                    <p className="text-[11.5px] text-white/50 leading-relaxed">
                      This history log preserves a high-fidelity snapshot of your request. Click the 
                      <strong className="text-white"> &ldquo;Open in Workspace&rdquo; </strong> 
                      button at the top right to restore this method, path, headers, and payload back into the active REST playground.
                    </p>
                    <p className="text-[11.5px] text-white/40 leading-relaxed">
                      Variables (like <code className="font-mono text-[#61AFFE] bg-white/5 px-1 py-0.5 rounded text-[10.5px]">{`{{baseUrl}}`}</code>) used in this request will automatically evaluate using your currently active environment values.
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-2 mt-4">
                    <span className="text-[10px] font-semibold text-white/30">Request Snap ID:</span>
                    <span className="font-mono text-[9.5px] text-white/40 select-all truncate max-w-[150px]">{selectedEntry.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
