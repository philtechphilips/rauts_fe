export type WorkspaceEnvVariableRow = {
  id: string;
  key: string;
  value: string;
};

export type WorkspaceEnvironment = {
  id: string;
  name: string;
  color: string;
  variables: WorkspaceEnvVariableRow[];
};

export type WorkspaceEnvironmentsPersist = {
  environments: WorkspaceEnvironment[];
  activeEnvironmentId: string;
};

/** Bumped when storage shape or key strategy changes (v2 = per-collection blobs). */
export const ENV_STORAGE_VERSION = 2;

/** Pre–v2: one environment set shared across all collections (migrated on first load per collection). */
function legacyEnvironmentsStorageKey(userKey: string): string {
  return `routiq-workspace-environments:${userKey}:v1`;
}

export function newRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isBaseUrlVariableKey(key: string): boolean {
  return key.trim().toLowerCase() === 'baseurl';
}

/** Keeps first baseUrl row as `baseUrl`; drops duplicate baseUrl keys; inserts default if missing */
export function normalizeEnvironmentVariables(variables: WorkspaceEnvVariableRow[]): WorkspaceEnvVariableRow[] {
  let baseFound = false;
  const out: WorkspaceEnvVariableRow[] = [];
  for (const v of variables) {
    if (isBaseUrlVariableKey(v.key)) {
      if (!baseFound) {
        baseFound = true;
        out.push({ ...v, key: 'baseUrl' });
      }
    } else {
      out.push({ ...v });
    }
  }
  if (!baseFound) {
    out.unshift({ id: newRowId(), key: 'baseUrl', value: 'http://localhost:3000' });
  }
  return out;
}

export function normalizeWorkspaceEnvironment(env: WorkspaceEnvironment): WorkspaceEnvironment {
  return {
    ...env,
    variables: normalizeEnvironmentVariables(env.variables),
  };
}

const COLORS = ['#49CC90', '#FCA130', '#F93E3E', '#61AFFE', '#CFFE26', '#B794F6'];

export function colorForIndex(i: number): string {
  return COLORS[i % COLORS.length]!;
}

export function createDefaultWorkspaceEnvironments(): WorkspaceEnvironment[] {
  const specs = [
    { name: 'Development', base: 'http://localhost:3000' },
    { name: 'Staging', base: 'https://staging.example.com' },
    { name: 'Production', base: 'https://api.example.com' },
  ];
  return specs.map((s, i) =>
    normalizeWorkspaceEnvironment({
      id: newRowId(),
      name: s.name,
      color: colorForIndex(i),
      variables: [
        { id: newRowId(), key: 'baseUrl', value: s.base },
        { id: newRowId(), key: 'token', value: '' },
      ],
    }),
  );
}

export function environmentsStorageKey(userKey: string, collectionId: string): string {
  return `routiq-workspace-environments:${userKey}:${collectionId}:v${ENV_STORAGE_VERSION}`;
}

export function loadWorkspaceEnvironments(
  userKey: string,
  collectionId: string,
): WorkspaceEnvironmentsPersist | null {
  if (typeof window === 'undefined' || !collectionId) return null;
  try {
    const scopedKey = environmentsStorageKey(userKey, collectionId);
    let raw = localStorage.getItem(scopedKey);
    if (!raw) {
      raw = localStorage.getItem(legacyEnvironmentsStorageKey(userKey));
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceEnvironmentsPersist;
    if (!Array.isArray(parsed.environments) || parsed.environments.length === 0) return null;
    const environments = parsed.environments.map(normalizeWorkspaceEnvironment);
    let { activeEnvironmentId } = parsed;
    if (!environments.some((e) => e.id === activeEnvironmentId)) {
      activeEnvironmentId = environments[0]!.id;
    }
    return { environments, activeEnvironmentId };
  } catch {
    return null;
  }
}

export function saveWorkspaceEnvironments(
  userKey: string,
  collectionId: string,
  data: WorkspaceEnvironmentsPersist,
): void {
  if (typeof window === 'undefined' || !collectionId) return;
  try {
    localStorage.setItem(environmentsStorageKey(userKey, collectionId), JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function variablesToRecord(variables: WorkspaceEnvVariableRow[]): Record<string, string> {
  const rec: Record<string, string> = {};
  for (const v of variables) {
    const k = v.key.trim();
    if (!k) continue;
    rec[k] = v.value;
  }
  return rec;
}

/** Replace `{{var}}`; unknown keys stay literal */
export function interpolateTemplates(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_full, rawKey: string) => {
    const key = rawKey.trim();
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key]! : `{{${key}}}`;
  });
}

/**
 * Active environment's `baseUrl` for a collection (trimmed, no trailing slashes).
 * `collectionId` is the dashboard collection id, e.g. `col-12`.
 */
export function getActiveWorkspaceResolvedBaseUrl(userKey: string, collectionId: string): string | null {
  const loaded = loadWorkspaceEnvironments(userKey, collectionId);
  if (!loaded) return null;
  const env = loaded.environments.find((e) => e.id === loaded.activeEnvironmentId);
  if (!env) return null;
  const raw = (variablesToRecord(env.variables)['baseUrl'] ?? '').trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

/** Resolved URL for the URL bar using active env vars */
export function resolveRequestDisplayUrl(pathDraft: string, vars: Record<string, string>): string {
  const rawBase = vars['baseUrl'] ?? '';
  const base = rawBase.replace(/\/+$/, '');
  const rawPath = pathDraft.trim() ? (pathDraft.startsWith('/') ? pathDraft : `/${pathDraft}`) : '/';
  const pathInterpolated = interpolateTemplates(rawPath, vars);
  return `${base}${pathInterpolated}`;
}
