import type { Method, UiCollection } from '@/types/dashboard-ui';

/** Sidebar expansion: folder key matches `CollectionsPanel` `${colId}-${folderName}`. */
export function findEndpointSidebarLocation(
  collections: UiCollection[],
  endpointId: string,
): { colId: string; folderKey: string } | null {
  for (const c of collections) {
    for (const f of c.folders) {
      if (f.endpoints.some((e) => e.id === endpointId)) {
        return { colId: c.id, folderKey: `${c.id}-${f.name}` };
      }
    }
  }
  return null;
}

export type DashboardHistoryEntry = {
  id: string;
  at: number;
  method: Method;
  /** Path segment shown in the URL bar (may contain {{vars}}). */
  pathDraft: string;
  resolvedUrl: string;
  status: number;
  statusText: string;
  ms: number;
  ok: boolean;
  error?: 'network';
  endpointId: string | null;
  endpointName: string | null;
};

export const REQUEST_HISTORY_STORAGE_VERSION = 1;
export const REQUEST_HISTORY_MAX = 100;

function storageKey(userKey: string): string {
  return `routiq-request-history-v${REQUEST_HISTORY_STORAGE_VERSION}-${userKey}`;
}

export function loadRequestHistory(userKey: string): DashboardHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, REQUEST_HISTORY_MAX);
  } catch {
    return [];
  }
}

function isHistoryEntry(x: unknown): x is DashboardHistoryEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.at === 'number' &&
    typeof o.method === 'string' &&
    typeof o.pathDraft === 'string' &&
    typeof o.resolvedUrl === 'string' &&
    typeof o.status === 'number' &&
    typeof o.statusText === 'string' &&
    typeof o.ms === 'number' &&
    typeof o.ok === 'boolean' &&
    (o.endpointId === null || typeof o.endpointId === 'string') &&
    (o.endpointName === null || typeof o.endpointName === 'string')
  );
}

/** Normalize API / legacy payloads into dashboard rows (drops invalid items). */
export function normalizeHistoryEntries(parsed: unknown): DashboardHistoryEntry[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isHistoryEntry).slice(0, REQUEST_HISTORY_MAX);
}

/** Merge server list with in-flight local rows without dropping newer unsynced items. */
export function mergeRequestHistoryById(
  server: DashboardHistoryEntry[],
  local: DashboardHistoryEntry[],
): DashboardHistoryEntry[] {
  const map = new Map<string, DashboardHistoryEntry>();
  for (const e of server) map.set(e.id, e);
  for (const e of local) {
    const cur = map.get(e.id);
    if (!cur || e.at >= cur.at) map.set(e.id, e);
  }
  return [...map.values()].sort((a, b) => b.at - a.at).slice(0, REQUEST_HISTORY_MAX);
}

export function saveRequestHistory(userKey: string, entries: DashboardHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      storageKey(userKey),
      JSON.stringify(entries.slice(0, REQUEST_HISTORY_MAX)),
    );
  } catch {
    /* quota / private mode */
  }
}

export function formatHistoryRelativeTime(at: number): string {
  const sec = Math.floor((Date.now() - at) / 1000);
  if (sec < 10) return 'now';
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

export function historyDayLabel(at: number): string {
  const d = new Date(at);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
