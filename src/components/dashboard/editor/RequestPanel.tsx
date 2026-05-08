'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useDashboard } from '../DashboardContext';
import { ParamTable } from '../ParamTable';
import { HeaderTable } from '../HeaderTable';
import {
  AUTH_TYPES,
  defaultAuthConfig,
  emptyFormDataRow,
  emptyHeaderRow,
  emptyParamRow,
  type AuthConfig,
  type AuthType,
  type FormDataFieldRow,
  type ManualHeaderRow,
  type ManualParamRow,
} from '@/types/request-draft';

const BODY_MODES = ['none', 'raw', 'form-data', 'x-www-form-urlencoded'] as const;

const JsonBodyEditor = dynamic(
  () => import('./JsonBodyEditor').then((m) => m.JsonBodyEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-lg border flex items-center justify-center font-mono text-[12px]"
        style={{
          minHeight: 280,
          background: '#181818',
          borderColor: '#3A3A3A',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        Loading editor…
      </div>
    ),
  },
);

function tryFormatJson(text: string): { ok: true; formatted: string } | { ok: false } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, formatted: '' };
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return { ok: true, formatted: JSON.stringify(parsed, null, 2) };
  } catch {
    return { ok: false };
  }
}

export function RequestPanel() {
  const {
    selectedEp,
    selectedEpId,
    reqTab,
    reqBodyMode,
    setReqBodyMode,
    rawBodyDraft,
    sampleBody,
    bodyDirty,
    setBodyRawDrafts,
    getCell,
    setCell,
    manualPathRowsByEp,
    setManualPathRowsByEp,
    manualQueryRowsByEp,
    setManualQueryRowsByEp,
    manualHeaderRowsByEp,
    setManualHeaderRowsByEp,
    formDataRowsByEp,
    setFormDataRowsByEp,
    urlEncodedRowsByEp,
    setUrlEncodedRowsByEp,
    authByEp,
    setAuthByEp,
  } = useDashboard();

  if (!selectedEp) return null;
  const manualPathRows = manualPathRowsByEp[selectedEpId] ?? [];
  const manualQueryRows = manualQueryRowsByEp[selectedEpId] ?? [];
  const manualHeaderRows = manualHeaderRowsByEp[selectedEpId] ?? [];
  const formDataRows = formDataRowsByEp[selectedEpId] ?? [];
  const urlEncodedRows = urlEncodedRowsByEp[selectedEpId] ?? [];
  const auth = authByEp[selectedEpId] ?? defaultAuthConfig();

  const authPreview = useMemo(() => {
    if (auth.type === 'No Auth') return 'No auth credentials will be attached.';
    if (auth.type === 'Bearer Token') return `${auth.type}: Authorization: Bearer ${auth.bearerToken || '(empty token)'}`;
    if (auth.type === 'API Key') {
      const where = auth.apiKeyAddTo === 'header' ? 'header' : 'query param';
      return `API Key: ${auth.apiKeyKey || '(key)'} in ${where}`;
    }
    if (auth.type === 'Basic Auth') return `Basic Auth: ${auth.basicUsername || '(username)'}`;
    return `OAuth 2.0: ${auth.oauthTokenType || 'Bearer'} token`;
  }, [auth]);

  const updateAuth = (patch: Partial<AuthConfig>) =>
    setAuthByEp((prev) => ({ ...prev, [selectedEpId]: { ...auth, ...patch } }));

  const updateManualParamRows = (
    kind: 'path' | 'query',
    updater: (rows: ManualParamRow[]) => ManualParamRow[],
  ) => {
    const setter = kind === 'path' ? setManualPathRowsByEp : setManualQueryRowsByEp;
    setter((prev) => ({ ...prev, [selectedEpId]: updater(prev[selectedEpId] ?? []) }));
  };

  const updateManualHeaderRows = (updater: (rows: ManualHeaderRow[]) => ManualHeaderRow[]) => {
    setManualHeaderRowsByEp((prev) => ({ ...prev, [selectedEpId]: updater(prev[selectedEpId] ?? []) }));
  };

  const updateFormDataRows = (updater: (rows: FormDataFieldRow[]) => FormDataFieldRow[]) => {
    setFormDataRowsByEp((prev) => ({ ...prev, [selectedEpId]: updater(prev[selectedEpId] ?? []) }));
  };

  const updateUrlEncodedRows = (updater: (rows: ManualHeaderRow[]) => ManualHeaderRow[]) => {
    setUrlEncodedRowsByEp((prev) => ({ ...prev, [selectedEpId]: updater(prev[selectedEpId] ?? []) }));
  };

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto border-b lg:border-b-0 lg:border-r lg:min-h-0"
      style={{ borderColor: '#3A3A3A' }}
    >
      {reqTab === 'Params' && (
        <div>
          {selectedEp.params.length > 0 && (
            <>
              <div
                className="px-4 py-1.5 border-b"
                style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
              >
                <span
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Path Variables
                </span>
              </div>
              <ParamTable
                rows={selectedEp.params}
                label="path variables"
                getValue={(p) => getCell('param-path', p.name, p.value || `{{${p.name}}}`)}
                onValueChange={(p, v) => setCell('param-path', p.name, v)}
              />
            </>
          )}
          <div
            className="px-4 py-1.5 border-b"
            style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
          >
            <span
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Query Params
            </span>
          </div>
          <ParamTable
            rows={selectedEp.query}
            label="query parameters"
            getValue={(p) => getCell('param-query', p.name, p.value || `{{${p.name}}}`)}
            onValueChange={(p, v) => setCell('param-query', p.name, v)}
          />
        </div>
      )}

      {reqTab === 'Authorization' && (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Type</label>
            <select
              value={auth.type}
              onChange={(e) => updateAuth({ type: e.target.value as AuthType })}
              className="px-3 py-1.5 rounded border text-[12px] outline-none"
              style={{ background: '#2A2A2A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.7)' }}
            >
              {AUTH_TYPES.map((o) => (
                <option key={o} style={{ background: '#1A1A1A' }}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 rounded-lg border space-y-3" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
            {auth.type === 'Bearer Token' && (
              <div>
                <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Token</label>
                <input
                  value={auth.bearerToken}
                  onChange={(e) => updateAuth({ bearerToken: e.target.value })}
                  className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                  style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                />
              </div>
            )}
            {auth.type === 'API Key' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Key</label>
                  <input
                    value={auth.apiKeyKey}
                    onChange={(e) => updateAuth({ apiKeyKey: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Value</label>
                  <input
                    value={auth.apiKeyValue}
                    onChange={(e) => updateAuth({ apiKeyValue: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Add to</label>
                  <select
                    value={auth.apiKeyAddTo}
                    onChange={(e) => updateAuth({ apiKeyAddTo: e.target.value as 'header' | 'query' })}
                    className="w-full px-3 py-2 rounded border text-[12px] outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.7)' }}
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Params</option>
                  </select>
                </div>
              </div>
            )}
            {auth.type === 'Basic Auth' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Username</label>
                  <input
                    value={auth.basicUsername}
                    onChange={(e) => updateAuth({ basicUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Password</label>
                  <input
                    type="password"
                    value={auth.basicPassword}
                    onChange={(e) => updateAuth({ basicPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
              </div>
            )}
            {auth.type === 'OAuth 2.0' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Access Token</label>
                  <input
                    value={auth.oauthToken}
                    onChange={(e) => updateAuth({ oauthToken: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
                <div>
                  <label className="text-[11px] block mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Token Type</label>
                  <input
                    value={auth.oauthTokenType}
                    onChange={(e) => updateAuth({ oauthTokenType: e.target.value })}
                    className="w-full px-3 py-2 rounded border text-[12px] font-mono outline-none"
                    style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                  />
                </div>
              </div>
            )}
            {auth.type === 'No Auth' && (
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                This request will be sent without auth headers or tokens.
              </p>
            )}
            <p className="text-[11px] border-t pt-3" style={{ color: 'rgba(255,255,255,0.3)', borderColor: '#3A3A3A' }}>
              {authPreview}
            </p>
          </div>
        </div>
      )}

      {reqTab === 'Headers' && (
        <div>
          <div
            className="px-4 py-1.5 border-b"
            style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
          >
            <span
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Request Headers
            </span>
          </div>
          <HeaderTable
            rows={selectedEp.headers}
            getValue={(h) => getCell('header', h.key, h.value)}
            onValueChange={(h, v) => setCell('header', h.key, v)}
          />
          <div className="px-4 py-3 border-t" style={{ borderColor: '#3A3A3A' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Manual Headers
              </span>
              <button
                type="button"
                onClick={() => updateManualHeaderRows((rows) => [...rows, emptyHeaderRow()])}
                className="px-2 py-1 rounded border text-[11px] font-semibold"
                style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
              >
                + Add Header
              </button>
            </div>
            {manualHeaderRows.length === 0 ? (
              <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                No manual headers yet.
              </p>
            ) : (
              <div className="space-y-2">
                {manualHeaderRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      placeholder="Header key"
                      value={row.key}
                      onChange={(e) =>
                        updateManualHeaderRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <input
                      placeholder="Header value"
                      value={row.value}
                      onChange={(e) =>
                        updateManualHeaderRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <button
                      type="button"
                      onClick={() => updateManualHeaderRows((rows) => rows.filter((r) => r.id !== row.id))}
                      className="px-2 py-1.5 rounded border text-[11px]"
                      style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {reqTab === 'Body' && (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            {BODY_MODES.map((t) => {
              const active = reqBodyMode === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReqBodyMode(t)}
                  className="flex items-center gap-1.5 text-[12px] transition-colors"
                  style={{ color: active ? '#CFFE26' : 'rgba(255,255,255,0.35)' }}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: active ? '#CFFE26' : 'rgba(255,255,255,0.2)' }}
                  >
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#CFFE26' }} />
                    )}
                  </div>
                  {t}
                </button>
              );
            })}
            {reqBodyMode === 'raw' && rawBodyDraft.trim() && (
              <span
                className="ml-auto text-[11px] px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(97,175,254,0.1)',
                  borderColor: 'rgba(97,175,254,0.3)',
                  color: '#61AFFE',
                }}
              >
                JSON
              </span>
            )}
          </div>
          {reqBodyMode === 'none' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                No body will be sent with this request
              </p>
            </div>
          )}
          {reqBodyMode === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const result = tryFormatJson(rawBodyDraft);
                    if (!result.ok) {
                      window.alert('Invalid JSON — fix syntax errors before formatting.');
                      return;
                    }
                    setBodyRawDrafts((prev) => ({ ...prev, [selectedEpId]: result.formatted }));
                  }}
                  className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded border transition-colors hover:bg-white/5"
                  style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
                >
                  Format JSON
                </button>
                {bodyDirty && (
                  <button
                    type="button"
                    onClick={() =>
                      setBodyRawDrafts((prev) => ({
                        ...prev,
                        [selectedEpId]: sampleBody,
                      }))
                    }
                    className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded border transition-colors hover:bg-white/5"
                    style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Reset to sample
                  </button>
                )}
              </div>
              <JsonBodyEditor
                value={rawBodyDraft}
                onChange={(next) =>
                  setBodyRawDrafts((prev) => ({ ...prev, [selectedEpId]: next }))
                }
              />
              {!sampleBody && !rawBodyDraft.trim() && (
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  No sample body for this endpoint — type your own JSON above.
                </p>
              )}
            </div>
          )}
          {reqBodyMode === 'form-data' && (
            <div className="rounded-lg border p-4" style={{ background: '#181818', borderColor: '#3A3A3A' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  multipart/form-data
                </p>
                <button
                  type="button"
                  onClick={() => updateFormDataRows((rows) => [...rows, emptyFormDataRow()])}
                  className="px-2 py-1 rounded border text-[11px] font-semibold"
                  style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
                >
                  + Add field
                </button>
              </div>
              {formDataRows.length === 0 ? (
                <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No form fields yet. Add keys as Text or File (like Postman).
                </p>
              ) : (
                <div className="space-y-3">
                  {formDataRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)_auto] sm:items-end"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          Key
                        </label>
                        <input
                          placeholder="field name"
                          value={row.key}
                          onChange={(e) =>
                            updateFormDataRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                            )
                          }
                          className="w-full px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                          style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          Type
                        </label>
                        <select
                          value={row.kind}
                          onChange={(e) =>
                            updateFormDataRows((rows) =>
                              rows.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      kind: e.target.value as 'text' | 'file',
                                      textValue: e.target.value === 'file' ? '' : r.textValue,
                                      file: e.target.value === 'text' ? null : r.file,
                                    }
                                  : r,
                              ),
                            )
                          }
                          className="w-full sm:w-[100px] px-2 py-1.5 rounded border text-[12px] outline-none"
                          style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.7)' }}
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      <div className="min-w-0">
                        <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          Value
                        </label>
                        {row.kind === 'text' ? (
                          <input
                            placeholder="value"
                            value={row.textValue}
                            onChange={(e) =>
                              updateFormDataRows((rows) =>
                                rows.map((r) => (r.id === row.id ? { ...r, textValue: e.target.value } : r)),
                              )
                            }
                            className="w-full px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                            style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                          />
                        ) : (
                          <div className="flex flex-col gap-1">
                            <input
                              type="file"
                              className="w-full text-[11px] file:mr-2 file:rounded file:border file:border-[#3A3A3A] file:bg-[#242424] file:px-2 file:py-1 file:text-[11px]"
                              style={{ color: 'rgba(255,255,255,0.45)' }}
                              onChange={(e) =>
                                updateFormDataRows((rows) =>
                                  rows.map((r) =>
                                    r.id === row.id ? { ...r, file: e.target.files?.[0] ?? null } : r,
                                  ),
                                )
                              }
                            />
                            {row.file && (
                              <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {row.file.name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex sm:pb-0.5">
                        <button
                          type="button"
                          onClick={() => updateFormDataRows((rows) => rows.filter((r) => r.id !== row.id))}
                          className="w-full sm:w-auto px-2 py-1.5 rounded border text-[11px]"
                          style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {reqBodyMode === 'x-www-form-urlencoded' && (
            <div className="rounded-lg border p-4" style={{ background: '#181818', borderColor: '#3A3A3A' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  application/x-www-form-urlencoded
                </p>
                <button
                  type="button"
                  onClick={() => updateUrlEncodedRows((rows) => [...rows, emptyHeaderRow()])}
                  className="px-2 py-1 rounded border text-[11px] font-semibold"
                  style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
                >
                  + Add pair
                </button>
              </div>
              {urlEncodedRows.length === 0 ? (
                <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No URL-encoded pairs yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {urlEncodedRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        placeholder="Key"
                        value={row.key}
                        onChange={(e) =>
                          updateUrlEncodedRows((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                          )
                        }
                        className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                        style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                      />
                      <input
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) =>
                          updateUrlEncodedRows((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                          )
                        }
                        className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                        style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                      />
                      <button
                        type="button"
                        onClick={() => updateUrlEncodedRows((rows) => rows.filter((r) => r.id !== row.id))}
                        className="px-2 py-1.5 rounded border text-[11px]"
                        style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {reqTab === 'Params' && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Manual Path Variables
              </span>
              <button
                type="button"
                onClick={() => updateManualParamRows('path', (rows) => [...rows, emptyParamRow()])}
                className="px-2 py-1 rounded border text-[11px] font-semibold"
                style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
              >
                + Add Path Param
              </button>
            </div>
            {manualPathRows.length === 0 ? (
              <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                No manual path variables yet.
              </p>
            ) : (
              <div className="space-y-2">
                {manualPathRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <input
                      placeholder="Key"
                      value={row.key}
                      onChange={(e) =>
                        updateManualParamRows('path', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <input
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        updateManualParamRows('path', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <input
                      placeholder="Description (optional)"
                      value={row.description}
                      onChange={(e) =>
                        updateManualParamRows('path', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                    />
                    <button
                      type="button"
                      onClick={() => updateManualParamRows('path', (rows) => rows.filter((r) => r.id !== row.id))}
                      className="px-2 py-1.5 rounded border text-[11px]"
                      style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Manual Query Params
              </span>
              <button
                type="button"
                onClick={() => updateManualParamRows('query', (rows) => [...rows, emptyParamRow()])}
                className="px-2 py-1 rounded border text-[11px] font-semibold"
                style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
              >
                + Add Query Param
              </button>
            </div>
            {manualQueryRows.length === 0 ? (
              <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                No manual query params yet.
              </p>
            ) : (
              <div className="space-y-2">
                {manualQueryRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <input
                      placeholder="Key"
                      value={row.key}
                      onChange={(e) =>
                        updateManualParamRows('query', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <input
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        updateManualParamRows('query', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] font-mono outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.68)' }}
                    />
                    <input
                      placeholder="Description (optional)"
                      value={row.description}
                      onChange={(e) =>
                        updateManualParamRows('query', (rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, description: e.target.value } : r)),
                        )
                      }
                      className="px-2 py-1.5 rounded border text-[12px] outline-none"
                      style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
                    />
                    <button
                      type="button"
                      onClick={() => updateManualParamRows('query', (rows) => rows.filter((r) => r.id !== row.id))}
                      className="px-2 py-1.5 rounded border text-[11px]"
                      style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
