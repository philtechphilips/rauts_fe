'use client';

import React, { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { JsonView } from '../JsonView';
import { IconCopy, IconInfoCircle } from '../icons';
import { STATUS_TEXT, stringifyBody } from '@/lib/dashboard/format';
import type { ResBodyView } from '@/hooks/dashboard/useDashboardState';
import type { Scenario } from '@/types/dashboard-ui';

const RES_BODY_LABELS = ['Pretty', 'Raw', 'None'] as const;
const RES_TABS = ['Body', 'Headers'];

const MOCK_RESPONSE_HEADERS = [
  { key: 'content-type', value: 'application/json; charset=utf-8' },
  { key: 'x-request-id', value: 'req_a1b2c3d4e5f6' },
  { key: 'cache-control', value: 'no-store, no-cache' },
  { key: 'x-ratelimit-remaining', value: '98' },
];

function bodySizeLabel(text: string) {
  const bytes = new Blob([text]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function scenarioTabLabel(s: Scenario) {
  const d = s.description?.trim();
  if (d) return d.length > 30 ? `${d.slice(0, 28)}…` : d;
  return String(s.status);
}

export function ResponsePanel() {
  const {
    selectedEp,
    activeScenario,
    statusOk,
    scenarioIdx,
    setScenarioIdx,
    resTab,
    setResTab,
    resBodyView,
    setResBodyView,
    liveHttpResponse,
    clearLiveHttpResponse,
    saveLiveResponseAsExample,
    savingLiveExample,
  } = useDashboard();

  const [saveExampleOpen, setSaveExampleOpen] = useState(false);
  const [exampleNameDraft, setExampleNameDraft] = useState('');
  const [saveExampleError, setSaveExampleError] = useState<string | null>(null);

  if (!selectedEp) return null;

  const showingLive = liveHttpResponse != null;
  const liveOk = showingLive ? (liveHttpResponse!.error ? false : liveHttpResponse!.ok) : false;
  const liveStatusText =
    showingLive && liveHttpResponse!.status
      ? STATUS_TEXT[liveHttpResponse!.status] ?? liveHttpResponse!.statusText
      : showingLive
        ? liveHttpResponse!.statusText
        : '';

  const liveJsonValue: unknown = showingLive
    ? liveHttpResponse!.parsedJson ??
      (() => {
        try {
          return JSON.parse(liveHttpResponse!.bodyText) as unknown;
        } catch {
          return liveHttpResponse!.bodyText;
        }
      })()
    : null;

  return (
    <div
      className="flex min-h-[36vh] w-full min-w-0 flex-1 shrink-0 flex-col overflow-hidden lg:h-auto lg:min-h-0 lg:w-[44%] lg:flex-none"
      style={{ background: '#1C1C1C' }}
    >
      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
        style={{ background: '#222', borderColor: '#3A3A3A' }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Response
        </span>
        {showingLive ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: liveHttpResponse!.error ? '#F93E3E' : liveOk ? '#49CC90' : '#F93E3E' }}
              />
              <span
                className="text-[12px] font-semibold"
                style={{
                  color: liveHttpResponse!.error ? '#F93E3E' : liveOk ? '#49CC90' : '#F93E3E',
                }}
              >
                {liveHttpResponse!.error ? 'Error' : liveHttpResponse!.status}{' '}
                {!liveHttpResponse!.error && liveStatusText}
              </span>
            </div>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {liveHttpResponse!.ms} ms
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {bodySizeLabel(liveHttpResponse!.bodyText)}
            </span>
          </div>
        ) : activeScenario ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: statusOk ? '#49CC90' : '#F93E3E' }}
              />
              <span
                className="text-[12px] font-semibold"
                style={{ color: statusOk ? '#49CC90' : '#F93E3E' }}
              >
                {activeScenario.status} {STATUS_TEXT[activeScenario.status] ?? ''}
              </span>
            </div>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              248 ms
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              1.4 KB
            </span>
          </div>
        ) : (
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Send a request to see the live response
          </span>
        )}
      </div>

      {/* Scenario selector vs live */}
      {showingLive ? (
        <div
          className="flex items-center justify-between px-3 py-1.5 shrink-0 border-b flex-wrap gap-2 select-none"
          style={{ background: '#222', borderColor: '#3A3A3A' }}
        >
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Live response
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                savingLiveExample ||
                Boolean(liveHttpResponse?.error === 'network')
              }
              onClick={() => {
                setSaveExampleError(null);
                setExampleNameDraft(
                  liveHttpResponse?.error !== 'network'
                    ? `Example ${liveHttpResponse!.status}`
                    : '',
                );
                setSaveExampleOpen(true);
              }}
              className="text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors hover:bg-white/5 disabled:opacity-35 disabled:pointer-events-none"
              style={{ borderColor: '#3A3A3A', color: '#fff' }}
            >
              {savingLiveExample ? 'Saving…' : 'Save as example'}
            </button>
            <button
              type="button"
              onClick={() => clearLiveHttpResponse()}
              className="text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors hover:bg-white/5"
              style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
            >
              Saved examples
            </button>
          </div>
        </div>
      ) : selectedEp.scenarios.length > 0 ? (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 shrink-0 border-b flex-wrap"
          style={{ background: '#222', borderColor: '#3A3A3A' }}
        >
          <span
            className="text-[10px] uppercase tracking-wider mr-1 shrink-0"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Example:
          </span>
          {selectedEp.scenarios.map((s, i) => {
            const ok = s.status < 400;
            const active = scenarioIdx === i;
            const tab = scenarioTabLabel(s);
            const hint =
              s.description?.trim() || `${s.status} ${STATUS_TEXT[s.status] ?? ''}`.trim();
            return (
              <button
                key={i}
                type="button"
                title={hint}
                onClick={() => setScenarioIdx(i)}
                className="px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors max-w-[min(200px,40vw)] truncate select-none"
                style={{
                  background: active
                    ? ok
                      ? 'rgba(73,204,144,0.1)'
                      : 'rgba(249,62,62,0.1)'
                    : 'transparent',
                  color: active ? (ok ? '#49CC90' : '#F93E3E') : 'rgba(255,255,255,0.28)',
                  borderColor: active
                    ? ok
                      ? 'rgba(73,204,144,0.35)'
                      : 'rgba(249,62,62,0.35)'
                    : '#3A3A3A',
                }}
              >
                <span style={{ opacity: 0.65 }}>{s.status}</span>
                {s.description?.trim() ? (
                  <>
                    <span style={{ opacity: 0.35 }} className="mx-1">
                      ·
                    </span>
                    <span>{tab}</span>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Response sub-tabs */}
      <div
        className="flex items-center shrink-0 border-b px-1 select-none"
        style={{ background: '#222', borderColor: '#3A3A3A' }}
      >
        {RES_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setResTab(tab)}
            className="px-3 py-1.5 text-[12px] border-b-2 transition-colors"
            style={{
              color: resTab === tab ? '#CFFE26' : 'rgba(255,255,255,0.38)',
              borderBottomColor: resTab === tab ? '#CFFE26' : 'transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Response body — select-text overrides dashboard root select-none */}
      <div className="flex-1 overflow-y-auto select-text cursor-auto">
        {resTab === 'Body' && showingLive && liveHttpResponse && (
          <div className="p-4 space-y-3">
            {liveHttpResponse.error === 'network' && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-lg border"
                style={{ background: 'rgba(249,62,62,0.06)', borderColor: 'rgba(249,62,62,0.25)' }}
              >
                <IconInfoCircle />
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {liveHttpResponse.bodyText}
                  <span className="block mt-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Check base URL, CORS, and that the server is reachable from your browser.
                  </span>
                </p>
              </div>
            )}
            {liveHttpResponse.error !== 'network' && (
              <>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2 select-none">
                  <div className="flex items-center gap-1">
                    {RES_BODY_LABELS.map((label) => {
                      const active = resBodyView === label.toLowerCase();
                      const v = label.toLowerCase() as ResBodyView;
                      return (
                        <React.Fragment key={label}>
                          <button
                            type="button"
                            onClick={() => setResBodyView(v)}
                            className="text-[11px] font-medium transition-colors px-1.5 py-0.5 rounded select-none"
                            style={{
                              color: active ? '#CFFE26' : 'rgba(255,255,255,0.28)',
                              background: active ? 'rgba(207,254,38,0.08)' : 'transparent',
                            }}
                          >
                            {label}
                          </button>
                          {label !== 'None' && (
                            <span className="text-[11px] px-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
                              |
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  {resBodyView !== 'none' && (
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard?.writeText(
                          liveHttpResponse.parsedJson != null
                            ? stringifyBody(liveHttpResponse.parsedJson)
                            : liveHttpResponse.bodyText,
                        )
                      }
                      className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-[#CFFE26] select-none"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      <IconCopy /> Copy
                    </button>
                  )}
                </div>
                {resBodyView === 'pretty' && (
                  <pre
                    className="p-4 rounded-lg border font-mono text-[12px] overflow-x-auto leading-[1.7] select-text cursor-text"
                    style={{ background: '#181818', borderColor: '#3A3A3A' }}
                  >
                    <JsonView value={liveJsonValue} />
                  </pre>
                )}
                {resBodyView === 'raw' && (
                  <pre
                    className="p-4 rounded-lg border font-mono text-[12px] overflow-x-auto leading-relaxed whitespace-pre-wrap select-text cursor-text"
                    style={{ background: '#181818', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
                  >
                    {liveHttpResponse.bodyText}
                  </pre>
                )}
                {resBodyView === 'none' && (
                  <div
                    className="flex flex-col items-center justify-center py-14 rounded-lg border text-center"
                    style={{ background: '#181818', borderColor: '#3A3A3A' }}
                  >
                    <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      Body hidden — choose Pretty or Raw
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {resTab === 'Body' && !showingLive && activeScenario && (
          <div className="p-4 space-y-3">
            {activeScenario.description && (
              <div
                className="flex items-start gap-2.5 p-3 rounded-lg border"
                style={{ background: '#242424', borderColor: '#3A3A3A' }}
              >
                <IconInfoCircle />
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {activeScenario.description}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2 select-none">
                <div className="flex items-center gap-1">
                  {RES_BODY_LABELS.map((label) => {
                    const active = resBodyView === label.toLowerCase();
                    const v = label.toLowerCase() as ResBodyView;
                    return (
                      <React.Fragment key={label}>
                        <button
                          type="button"
                          onClick={() => setResBodyView(v)}
                          className="text-[11px] font-medium transition-colors px-1.5 py-0.5 rounded select-none"
                          style={{
                            color: active ? '#CFFE26' : 'rgba(255,255,255,0.28)',
                            background: active ? 'rgba(207,254,38,0.08)' : 'transparent',
                          }}
                        >
                          {label}
                        </button>
                        {label !== 'None' && (
                          <span className="text-[11px] px-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
                            |
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {resBodyView !== 'none' && (
                  <button
                    type="button"
                    onClick={() =>
                      void navigator.clipboard?.writeText(stringifyBody(activeScenario.body))
                    }
                    className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-[#CFFE26] select-none"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                  >
                    <IconCopy /> Copy
                  </button>
                )}
              </div>
              {resBodyView === 'pretty' && (
                <pre
                  className="p-4 rounded-lg border font-mono text-[12px] overflow-x-auto leading-[1.7] select-text cursor-text"
                  style={{ background: '#181818', borderColor: '#3A3A3A' }}
                >
                  <JsonView value={activeScenario.body} />
                </pre>
              )}
              {resBodyView === 'raw' && (
                <pre
                  className="p-4 rounded-lg border font-mono text-[12px] overflow-x-auto leading-relaxed whitespace-pre-wrap select-text cursor-text"
                  style={{ background: '#181818', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
                >
                  {stringifyBody(activeScenario.body)}
                </pre>
              )}
              {resBodyView === 'none' && (
                <div
                  className="flex flex-col items-center justify-center py-14 rounded-lg border text-center"
                  style={{ background: '#181818', borderColor: '#3A3A3A' }}
                >
                  <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.22)' }}>
                    Body hidden — choose Pretty or Raw to show the response payload
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {resTab === 'Body' && !showingLive && !activeScenario && (
          <div className="p-8 text-center">
            <p className="text-[12px] italic" style={{ color: 'rgba(255,255,255,0.22)' }}>
              No saved examples for this request. Click Send to load the real response.
            </p>
          </div>
        )}

        {resTab === 'Headers' && showingLive && liveHttpResponse && (
          <div className="p-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#3A3A3A' }}>
                  <th
                    className="py-2 text-left font-medium"
                    style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  >
                    Key
                  </th>
                  <th
                    className="py-2 pl-4 text-left font-medium"
                    style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {liveHttpResponse.headers.map((h, i) => (
                  <tr
                    key={`${i}-${h.key}`}
                    className="border-b transition-colors"
                    style={{ borderColor: '#2A2A2A' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#242424')}
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'transparent')
                    }
                  >
                    <td className="py-2 font-mono" style={{ color: '#61AFFE' }}>
                      {h.key}
                    </td>
                    <td className="py-2 pl-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {h.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {resTab === 'Headers' && !showingLive && (
          <div className="p-4">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#3A3A3A' }}>
                  <th
                    className="py-2 text-left font-medium"
                    style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  >
                    Key
                  </th>
                  <th
                    className="py-2 pl-4 text-left font-medium"
                    style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RESPONSE_HEADERS.map((h) => (
                  <tr
                    key={h.key}
                    className="border-b transition-colors"
                    style={{ borderColor: '#2A2A2A' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#242424')}
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = 'transparent')
                    }
                  >
                    <td className="py-2 font-mono" style={{ color: '#61AFFE' }}>
                      {h.key}
                    </td>
                    <td className="py-2 pl-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {h.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {saveExampleOpen && liveHttpResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-example-title"
          onClick={() => setSaveExampleOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-xl select-text"
            style={{ background: '#222', borderColor: '#3A3A3A' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="save-example-title" className="text-[14px] font-semibold text-white mb-1">
              Save as example
            </h2>
            <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Stores this live response body as a saved example for this request (HTTP {liveHttpResponse.status}
              ).
            </p>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Example name
            </label>
            <input
              type="text"
              value={exampleNameDraft}
              onChange={(e) => setExampleNameDraft(e.target.value)}
              placeholder={`Example ${liveHttpResponse.status}`}
              className="w-full rounded-lg border px-3 py-2 text-[13px] mb-3 outline-none focus:border-[#CFFE26]"
              style={{
                background: '#181818',
                borderColor: '#3A3A3A',
                color: '#fff',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSaveExampleOpen(false);
              }}
            />
            {saveExampleError && (
              <p className="text-[11px] mb-3" style={{ color: '#F93E3E' }}>
                {saveExampleError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors hover:bg-white/5"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
                onClick={() => setSaveExampleOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingLiveExample}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40"
                style={{ background: '#CFFE26', color: '#111' }}
                onClick={() => {
                  void (async () => {
                    try {
                      setSaveExampleError(null);
                      await saveLiveResponseAsExample(exampleNameDraft);
                      setSaveExampleOpen(false);
                    } catch (err) {
                      setSaveExampleError(err instanceof Error ? err.message : 'Save failed');
                    }
                  })();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
