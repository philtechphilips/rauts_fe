import { api } from '@/lib/api';
import { normalizeHistoryEntries, type DashboardHistoryEntry } from '@/lib/dashboard/request-history';

export async function fetchBackendRequestHistory(): Promise<DashboardHistoryEntry[]> {
  const res = (await api.get('/dashboard/request-history')) as { entries?: unknown };
  return normalizeHistoryEntries(res.entries);
}

export async function pushBackendRequestHistoryEntry(entry: DashboardHistoryEntry): Promise<void> {
  await api.post('/dashboard/request-history', entry);
}

export async function clearBackendRequestHistory(): Promise<void> {
  await api.delete('/dashboard/request-history');
}
