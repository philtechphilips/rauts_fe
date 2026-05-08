import { interpolateDeep, resolveVariableMap } from '@/lib/dashboard/interpolate-deep';
import type { UiEndpoint } from '@/types/dashboard-ui';
import type {
  AuthConfig,
  FormDataFieldRow,
  ManualHeaderRow,
  ManualParamRow,
} from '@/types/request-draft';

export type DashboardReqBodyMode = 'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded';

export type BuildDashboardFetchInput = {
  envVars: Record<string, string>;
  ep: UiEndpoint;
  /** When set (e.g. unsaved method picker), overrides `ep.method` for the outgoing request. */
  methodOverride?: string;
  pathDraft: string;
  rawBodyDraft: string;
  reqBodyMode: DashboardReqBodyMode;
  getCell: (kind: 'param-path' | 'param-query' | 'header', id: string, fallback: string) => string;
  manualPathRows: ManualParamRow[];
  manualQueryRows: ManualParamRow[];
  manualHeaderRows: ManualHeaderRow[];
  formDataRows: FormDataFieldRow[];
  urlEncodedRows: ManualHeaderRow[];
  auth: AuthConfig;
};

function utf8ToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function methodsWithoutBody(method: string): boolean {
  const m = method.toUpperCase();
  return m === 'GET' || m === 'HEAD';
}

function buildMergedVars(input: BuildDashboardFetchInput): Record<string, string> {
  const { envVars, ep, getCell, manualPathRows, manualQueryRows } = input;
  const vars: Record<string, string> = { ...envVars };
  for (const p of ep.params) {
    vars[p.name] = getCell('param-path', p.name, p.value ?? '');
  }
  for (const p of ep.query) {
    vars[p.name] = getCell('param-query', p.name, p.value ?? '');
  }
  for (const row of manualPathRows) {
    const k = row.key.trim();
    if (k) vars[k] = row.value;
  }
  for (const row of manualQueryRows) {
    const k = row.key.trim();
    if (k) vars[k] = row.value;
  }
  return resolveVariableMap(vars);
}

function applyAuthHeaders(headers: Headers, auth: AuthConfig, vars: Record<string, string>): void {
  const resolved = (s: string) => interpolateDeep(s, vars);

  if (auth.type === 'Bearer Token') {
    const t = resolved(auth.bearerToken).trim();
    if (t) headers.set('Authorization', `Bearer ${t}`);
    return;
  }
  if (auth.type === 'API Key' && auth.apiKeyAddTo === 'header') {
    const key = resolved(auth.apiKeyKey).trim();
    const val = resolved(auth.apiKeyValue);
    if (key) headers.set(key, val);
    return;
  }
  if (auth.type === 'Basic Auth') {
    const u = resolved(auth.basicUsername);
    const p = resolved(auth.basicPassword);
    if (u || p) {
      headers.set('Authorization', `Basic ${utf8ToBase64(`${u}:${p}`)}`);
    }
    return;
  }
  if (auth.type === 'OAuth 2.0') {
    const tt = resolved(auth.oauthTokenType).trim() || 'Bearer';
    const tok = resolved(auth.oauthToken).trim();
    if (tok) headers.set('Authorization', `${tt} ${tok}`);
  }
}

/** Build absolute URL + fetch init from dashboard drafts */
export function buildDashboardFetchRequest(input: BuildDashboardFetchInput): { url: string; init: RequestInit } {
  const vars = buildMergedVars(input);
  const {
    ep,
    methodOverride,
    pathDraft,
    rawBodyDraft,
    reqBodyMode,
    manualHeaderRows,
    manualQueryRows,
    formDataRows,
    urlEncodedRows,
    auth,
    getCell,
  } = input;

  const rawBase = interpolateDeep(vars['baseUrl'] ?? '', vars).trim().replace(/\/+$/, '');
  const pathSeg = interpolateDeep(pathDraft.trim() ? (pathDraft.startsWith('/') ? pathDraft : `/${pathDraft}`) : '/', vars);

  const qp = new URLSearchParams();
  for (const p of ep.query) {
    const val = interpolateDeep(getCell('param-query', p.name, p.value ?? ''), vars).trim();
    if (val !== '') qp.append(p.name, val);
  }
  for (const row of manualQueryRows) {
    const k = row.key.trim();
    if (!k) continue;
    const val = interpolateDeep(row.value, vars).trim();
    if (val !== '') qp.append(k, val);
  }
  if (auth.type === 'API Key' && auth.apiKeyAddTo === 'query') {
    const k = interpolateDeep(auth.apiKeyKey, vars).trim();
    const val = interpolateDeep(auth.apiKeyValue, vars);
    if (k) qp.append(k, val);
  }

  const qs = qp.toString();
  const url = `${rawBase}${pathSeg}${qs ? `?${qs}` : ''}`;

  const headers = new Headers();

  for (const h of ep.headers) {
    const key = h.key.trim();
    if (!key) continue;
    const val = interpolateDeep(getCell('header', h.key, h.value), vars);
    if (val !== '') headers.set(key, val);
  }

  for (const row of manualHeaderRows) {
    const k = row.key.trim();
    if (!k) continue;
    headers.set(k, interpolateDeep(row.value, vars));
  }

  applyAuthHeaders(headers, auth, vars);

  const method = (input.methodOverride ?? ep.method).toUpperCase();
  const init: RequestInit = { method, headers };

  if (!methodsWithoutBody(method)) {
    if (reqBodyMode === 'raw' && rawBodyDraft.trim()) {
      const bodyStr = interpolateDeep(rawBodyDraft, vars);
      init.body = bodyStr;
      if (!headers.has('Content-Type')) {
        const t = bodyStr.trim();
        const looksJson =
          (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'));
        headers.set('Content-Type', looksJson ? 'application/json' : 'text/plain;charset=UTF-8');
      }
    } else if (reqBodyMode === 'form-data') {
      const fd = new FormData();
      for (const row of formDataRows) {
        const k = row.key.trim();
        if (!k) continue;
        if (row.kind === 'text') {
          fd.append(k, interpolateDeep(row.textValue, vars));
        } else if (row.file) {
          fd.append(k, row.file);
        }
      }
      init.body = fd;
      headers.delete('Content-Type');
    } else if (reqBodyMode === 'x-www-form-urlencoded') {
      const enc = new URLSearchParams();
      for (const row of urlEncodedRows) {
        const k = row.key.trim();
        if (!k) continue;
        enc.append(k, interpolateDeep(row.value, vars));
      }
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      init.body = enc.toString();
    }
  }

  return { url, init };
}
