import { api } from '@/lib/api';
import type {
  Header,
  Method,
  Param,
  Scenario,
  UiCollection,
  UiEndpoint,
  UiFolder,
} from '@/types/dashboard-ui';

interface ApiEndpoint {
  id: number;
  method: string;
  path: string;
  name: string;
  category: string;
  sortOrder?: number;
  sourceFile: string;
  description: string | null;
  body: string | null;
  scenarios: unknown;
  params?: unknown;
  query?: unknown;
  headers?: unknown;
  responseSummary?: string | null;
}

interface ApiProject {
  id: number;
  name: string;
  framework: string;
  description: string | null;
  sortOrder?: number;
  folderOrder?: string[] | null;
  folderOverviews?: { name: string; description: string }[] | null;
  docsPublished?: boolean;
  docsBaseUrl?: string | null;
  apiRoutePrefix?: string | null;
  endpoints?: ApiEndpoint[];
}

interface ProjectsListResponse {
  success?: boolean;
  projects?: ApiProject[];
}

export function normalizeMethod(m: string): Method {
  const u = (m || 'GET').toUpperCase();
  const allowed: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  return (allowed.includes(u as Method) ? u : 'GET') as Method;
}

function headersFromBody(body: string | null): Header[] {
  if (!body?.trim()) return [];
  try {
    JSON.parse(body);
    return [{ key: 'Content-Type', value: 'application/json' }];
  } catch {
    return [];
  }
}

function parseParamLike(raw: unknown): Param[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x: unknown) => {
      const o = x as Record<string, unknown>;
      const name = String(o.name ?? '');
      if (!name) return null;
      const value =
        typeof o.value === 'string' && o.value.length > 0
          ? o.value
          : `{{${name}}}`;
      const description = typeof o.description === 'string' ? o.description : '';
      const required = Boolean(o.required);
      return { name, value, description, required };
    })
    .filter(Boolean) as Param[];
}

function parseHeaders(raw: unknown): Header[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x: unknown) => {
      const o = x as Record<string, unknown>;
      const key = String(o.key ?? o.name ?? '');
      if (!key) return null;
      const value = String(o.value ?? o.type ?? o.description ?? '');
      return { key, value };
    })
    .filter(Boolean) as Header[];
}

function coerceScenariosArray(raw: unknown): unknown[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return null;
    try {
      const v = JSON.parse(t) as unknown;
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeScenarios(raw: unknown): Scenario[] {
  const arr = coerceScenariosArray(raw);
  if (!arr || arr.length === 0) {
    return [
      {
        status: 200,
        description: 'Re-run a Rauts CLI scan (with AI) to capture response examples.',
        body: {},
      },
    ];
  }
  return arr.map((item: unknown) => {
    const s = item as Record<string, unknown>;
    const status = typeof s.status === 'number' ? s.status : 200;
    const description = typeof s.description === 'string' ? s.description : '';
    const body =
      'body' in s && s.body !== undefined ? s.body : 'data' in s && s.data !== undefined ? s.data : {};
    return { status, description, body };
  });
}

function folderOverviewFor(
  overviews: ApiProject['folderOverviews'],
  folderName: string,
): string | undefined {
  if (!Array.isArray(overviews) || overviews.length === 0) return undefined;
  const k = folderName.trim().toLowerCase();
  const row = overviews.find(
    (o) =>
      o &&
      typeof o.name === 'string' &&
      o.name.trim().toLowerCase() === k &&
      typeof o.description === 'string' &&
      o.description.trim().length > 0,
  );
  return row?.description.trim();
}

function mapEndpoint(ep: ApiEndpoint): UiEndpoint {
  const bodyStr = ep.body ?? '';
  const fromApi = parseHeaders(ep.headers);
  const headers = fromApi.length > 0 ? fromApi : headersFromBody(ep.body);

  return {
    id: `ep-${ep.id}`,
    method: normalizeMethod(ep.method),
    name: ep.name || ep.path,
    path: ep.path,
    description: ep.description ?? '',
    body: bodyStr,
    params: parseParamLike(ep.params),
    query: parseParamLike(ep.query),
    headers,
    scenarios: normalizeScenarios(ep.scenarios),
    response: ep.responseSummary ?? undefined,
  };
}

function projectToCollection(p: ApiProject): UiCollection {
  const endpoints = p.endpoints ?? [];
  const byCategory = new Map<string, ApiEndpoint[]>();
  for (const ep of endpoints) {
    const cat = (ep.category || 'General').trim() || 'General';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(ep);
  }
  for (const folderName of p.folderOrder ?? []) {
    const n = (folderName || 'General').trim() || 'General';
    const exists = [...byCategory.keys()].some(
      (k) => k.trim().toLowerCase() === n.toLowerCase(),
    );
    if (!exists) byCategory.set(n, []);
  }
  for (const eps of byCategory.values()) {
    eps.sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id,
    );
  }
  let folders: UiFolder[] = [...byCategory.entries()].map(([name, eps]) => ({
    name,
    overview: folderOverviewFor(p.folderOverviews, name),
    endpoints: eps.map(mapEndpoint),
  }));
  if (folders.length === 0) {
    folders = [{ name: 'General', endpoints: [] }];
  }
  folders.sort((a, b) => a.name.localeCompare(b.name));
  return {
    id: `col-${p.id}`,
    name: p.name,
    description: p.description ?? '',
    framework: p.framework,
    folders,
    folderOverviewsRaw: p.folderOverviews ?? null,
    docsPublished: Boolean(p.docsPublished),
    docsBaseUrl: p.docsBaseUrl?.trim() || undefined,
    apiRoutePrefix: p.apiRoutePrefix?.trim() || undefined,
  };
}

/**
 * Build the full `folderOverviews` payload for PATCH, merging API rows with the
 * current tree so we never wipe AI summaries for folders the UI did not map
 * onto `folder.overview` (e.g. name mismatch) or rows not tied to an endpoint category.
 */
export function buildFolderOverviewsForSave(
  col: UiCollection,
  oldFolderName: string,
  newFolderName: string,
  draftOverview: string,
): { name: string; description: string }[] {
  const map = new Map<string, { name: string; description: string }>();

  for (const o of col.folderOverviewsRaw ?? []) {
    const k = o.name.trim().toLowerCase();
    map.set(k, { name: o.name, description: o.description ?? '' });
  }

  const oldK = oldFolderName.trim().toLowerCase();
  const newK = newFolderName.trim().toLowerCase();
  if (oldK !== newK) {
    const row = map.get(oldK);
    if (row) {
      map.delete(oldK);
      map.set(newK, { name: newFolderName, description: row.description });
    }
  }

  map.set(newK, {
    name: newFolderName,
    description: draftOverview.trim(),
  });

  for (const f of col.folders) {
    const nm = f.name === oldFolderName ? newFolderName : f.name;
    const k = nm.trim().toLowerCase();
    if (!map.has(k)) {
      map.set(k, {
        name: nm,
        description: f.overview?.trim() ?? '',
      });
    }
  }

  return [...map.values()];
}

export async function loadUserDashboardCollections(): Promise<UiCollection[]> {
  const res = (await api.get('/projects/list')) as ProjectsListResponse;
  const projects = res.projects ?? [];
  return projects.map(projectToCollection);
}
