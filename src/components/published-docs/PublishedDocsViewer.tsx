'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RautsLogo } from '@/components/common/Logo';

interface Param    { name: string; type: string; required: boolean; description: string; example?: string }
interface Header   { key: string; value: string; description?: string }
interface Scenario { status: number; description: string; body: unknown }
interface Endpoint {
  id: string;
  method: string;
  name: string;
  path: string;
  description: string;
  body?: string;
  bodySchema?: Record<string, string>;
  params: Param[];
  query: Param[];
  headers: Header[];
  scenarios: Scenario[];
}
interface Folder     { name: string; description?: string; endpoints: Endpoint[] }
export interface PublishedDocsCollection {
  id: string;
  name: string;
  version: string;
  baseUrl: string;
  description: string;
  docsPublished?: boolean;
  folders: Folder[];
}

type Collection = PublishedDocsCollection;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const M_COLOR: Record<string, string> = {
  GET: '#61AFFE', POST: '#49CC90', PUT: '#FCA130',
  PATCH: '#50E3C2', DELETE: '#F93E3E', OPTIONS: '#888', HEAD: '#888',
};
const M_BG: Record<string, string> = {
  GET: 'rgba(97,175,254,0.1)', POST: 'rgba(73,204,144,0.1)', PUT: 'rgba(252,161,48,0.1)',
  PATCH: 'rgba(80,227,194,0.1)', DELETE: 'rgba(249,62,62,0.1)',
  OPTIONS: 'rgba(255,255,255,0.08)', HEAD: 'rgba(255,255,255,0.08)',
};
const STATUS_TEXT: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request',
  401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict',
  422: 'Unprocessable Entity', 500: 'Internal Server Error',
};

function MethodPill({ method, size = 'sm' }: { method: string; size?: 'sm' | 'md' | 'lg' }) {
  const pad = size === 'lg' ? 'px-3 py-1 text-[12px]' : size === 'md' ? 'px-2.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-[10px]';
  return (
    <span className={`${pad} rounded font-bold tracking-wide shrink-0`}
      style={{ background: M_BG[method] ?? 'rgba(255,255,255,0.08)', color: M_COLOR[method] ?? '#888', border: `1px solid ${M_COLOR[method] ?? '#888'}22` }}>
      {method}
    </span>
  );
}

function StatusBadge({ code }: { code: number }) {
  const ok = code < 400;
  return (
    <span className="px-2.5 py-1 rounded text-[12px] font-semibold"
      style={{ background: ok ? 'rgba(73,204,144,0.1)' : 'rgba(249,62,62,0.1)', color: ok ? '#49CC90' : '#F93E3E', border: `1px solid ${ok ? 'rgba(73,204,144,0.25)' : 'rgba(249,62,62,0.25)'}` }}>
      {code} {STATUS_TEXT[code]}
    </span>
  );
}

function JsonView({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="italic" style={{ color: 'rgba(255,255,255,0.2)' }}>Empty body (204)</span>;
  }
  const lines = JSON.stringify(value, null, 2).split('\n').map((line, i) => {
    const html = line
      .replace(/("([^"]+)")\s*:/g, '<span style="color:#9CDCFE">$1</span>:')
      .replace(/:\s*("([^"]*)")/g, ': <span style="color:#CE9178">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#B5CEA8">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span style="color:#569CD6">$1</span>');
    return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
  });
  return <>{lines}</>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-colors"
      style={{ background: copied ? 'rgba(207,254,38,0.1)' : 'rgba(255,255,255,0.06)', color: copied ? '#CFFE26' : 'rgba(255,255,255,0.4)', border: `1px solid ${copied ? 'rgba(207,254,38,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>Copied</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      )}
    </button>
  );
}

function CodeSnippet({ data, endpoint }: { data: Collection; endpoint: Endpoint }) {
  const [lang, setLang] = useState<'curl' | 'js' | 'python'>('curl');
  const url = `${data.baseUrl}${endpoint.path}`;
  const hasBody = !!(
    endpoint.method !== 'GET' &&
    endpoint.method !== 'HEAD' &&
    endpoint.method !== 'DELETE' &&
    endpoint.body
  );

  const snippets: Record<string, string> = {
    curl: [
      `curl -X ${endpoint.method} \\`,
      `  '${url}' \\`,
      `  -H 'Authorization: Bearer YOUR_TOKEN'`,
      ...(hasBody ? [`  -H 'Content-Type: application/json' \\`, `  -d '${endpoint.body?.split('\n').join('\n      ')}'`] : []),
    ].join('\n'),

    js: [
      `const response = await fetch('${url}', {`,
      `  method: '${endpoint.method}',`,
      `  headers: {`,
      `    Authorization: 'Bearer YOUR_TOKEN',`,
      ...(hasBody ? [`    'Content-Type': 'application/json',`] : []),
      `  },`,
      ...(hasBody ? [`  body: JSON.stringify(${endpoint.body}),`] : []),
      `});`,
      ``,
      `const data = await response.json();`,
      `console.log(data);`,
    ].join('\n'),

    python: [
      `import requests`,
      ``,
      `url = "${url}"`,
      `headers = {"Authorization": "Bearer YOUR_TOKEN"${hasBody ? ', "Content-Type": "application/json"' : ''}}`,
      ...(hasBody ? [`payload = ${endpoint.body}`] : []),
      ``,
      `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${hasBody ? ', json=payload' : ''})`,
      `print(response.json())`,
    ].join('\n'),
  };

  const labels: Record<string, string> = { curl: 'cURL', js: 'JavaScript', python: 'Python' };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: '#181818', borderColor: '#3A3A3A' }}>
      {/* Lang switcher */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
        {(['curl', 'js', 'python'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className="px-3 py-1 rounded text-[11px] font-medium transition-colors"
            style={{ background: lang === l ? 'rgba(207,254,38,0.1)' : 'transparent', color: lang === l ? '#CFFE26' : 'rgba(255,255,255,0.35)' }}>
            {labels[l]}
          </button>
        ))}
        <div className="flex-1" />
        <CopyButton text={snippets[lang]} />
      </div>
      <pre className="p-4 text-[12px] font-mono leading-[1.75] overflow-x-auto" style={{ color: '#ABB2BF' }}>
        {snippets[lang]}
      </pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PublishedDocsViewer({ 
  data, 
  isPreviewMode = false,
  projectId
}: { 
  data: PublishedDocsCollection;
  isPreviewMode?: boolean;
  projectId?: string;
}) {
  const allEndpoints = data.folders.flatMap(f => f.endpoints);
  const [selectedId,   setSelectedId]   = useState<string | 'overview'>('overview');
  const [scenarioIdx,  setScenarioIdx]  = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(
    Object.fromEntries(data.folders.map(f => [f.name, true]))
  );
  const [searchQ, setSearchQ] = useState('');

  const selectedEp = allEndpoints.find(e => e.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setScenarioIdx(0);
  };

  const authExampleEp =
    allEndpoints.find((e) => e.method === 'POST' && e.path.toLowerCase().includes('login')) ??
    allEndpoints.find((e) => e.method === 'POST') ??
    allEndpoints[0] ??
    null;

  const filteredFolders = searchQ.trim()
    ? data.folders.map(f => ({
        ...f,
        endpoints: f.endpoints.filter(e =>
          e.name.toLowerCase().includes(searchQ.toLowerCase()) ||
          e.path.toLowerCase().includes(searchQ.toLowerCase())
        ),
      })).filter(f => f.endpoints.length > 0)
    : data.folders;

  const activeScenario = selectedEp?.scenarios[scenarioIdx] ?? null;
  const totalEndpoints = data.folders.reduce((a, f) => a + f.endpoints.length, 0);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden"
      style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}>

      {isPreviewMode && (
        <div 
          className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center justify-between gap-4 select-none relative z-50 text-[12px]"
        >
          <div className="flex items-center gap-2 text-yellow-500">
            <svg className="w-4 h-4 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold uppercase tracking-wider text-[9px] bg-yellow-500/20 px-2 py-0.5 rounded-md shrink-0">Preview Mode</span>
            <span className="text-white/80 font-medium">This collection is private and not published to the public. Only you can see this preview.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="px-3 py-1 rounded bg-[#CFFE26] hover:bg-[#d4e820] text-black font-bold text-[11px] transition-all hover:scale-[1.02] shrink-0"
          >
            Go Live / Publish
          </button>
        </div>
      )}

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:gap-4 sm:px-6 md:flex-nowrap md:py-0"
        style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}>
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 mr-2 shrink-0 hover:opacity-85 transition-opacity"
        >
          <RautsLogo className="w-7 h-7 shrink-0" />
          <div>
            <div className="text-[13px] font-semibold" style={{ color: '#E8E8F0' }}>{data.name}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{data.baseUrl}</div>
          </div>
        </Link>

        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ background: 'rgba(207,254,38,0.1)', color: '#CFFE26', border: '1px solid rgba(207,254,38,0.25)' }}>
          {data.version}
        </span>

        <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Search */}
        <div className="flex min-w-[120px] flex-1 items-center gap-2 rounded-lg px-3 py-1.5 md:max-w-md"
          style={{ background: '#2A2A2A', border: '1px solid #3A3A3A' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search endpoints…"
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: 'rgba(255,255,255,0.6)' }} />
          <kbd className="hidden text-[10px] px-1.5 py-0.5 rounded sm:inline"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}>
            ⌘K
          </kbd>
        </div>

        <div className="hidden min-w-[12px] flex-1 md:block" />

        {/* Auth indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0"
          style={{ background: '#2A2A2A', border: '1px solid #3A3A3A' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Bearer Token</span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#49CC90' }} />
        </div>

        {/* Run in workspace */}
        <a href="/dashboard"
          className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-semibold text-black transition-colors hover:bg-[#d4e820] sm:px-4"
          style={{ background: '#CFFE26' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span className="hidden sm:inline">Run in Workspace</span>
          <span className="sm:hidden">Workspace</span>
        </a>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

        {/* ── Left sidebar ─────────────────────────────────────── */}
        <nav className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-hidden border-b lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r" style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}>

          {/* Overview link */}
          <div className="px-3 pt-4 pb-2">
            <button onClick={() => setSelectedId('overview')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors text-left"
              style={{
                background: selectedId === 'overview' ? 'rgba(207,254,38,0.08)' : 'transparent',
                color: selectedId === 'overview' ? '#CFFE26' : 'rgba(255,255,255,0.5)',
                border: selectedId === 'overview' ? '1px solid rgba(207,254,38,0.15)' : '1px solid transparent',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              Overview
            </button>
          </div>

          <div className="mx-3 mb-3" style={{ height: 1, background: '#3A3A3A' }} />

          {/* Endpoint tree */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {filteredFolders.map(folder => {
              const open = expandedFolders[folder.name] ?? true;
              return (
                <div key={folder.name} className="mb-1">
                  <button
                    onClick={() => setExpandedFolders(p => ({ ...p, [folder.name]: !p[folder.name] }))}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)')}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ transition: 'transform 0.15s', transform: open ? 'none' : 'rotate(-90deg)' }}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{folder.name}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{folder.endpoints.length}</span>
                  </button>

                  {open && (
                    <div className="ml-3 mt-0.5 mb-1 space-y-0.5">
                      {folder.endpoints.map(ep => {
                        const sel = selectedId === ep.id;
                        return (
                          <button key={ep.id} onClick={() => handleSelect(ep.id)}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors"
                            style={{
                              background: sel ? 'rgba(207,254,38,0.06)' : 'transparent',
                              border: sel ? '1px solid rgba(207,254,38,0.12)' : '1px solid transparent',
                            }}>
                            <MethodPill method={ep.method} />
                            <span className="flex-1 text-[12px] truncate"
                              style={{ color: sel ? '#E8E8F0' : 'rgba(255,255,255,0.55)' }}>
                              {ep.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t text-center" style={{ borderColor: '#3A3A3A' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Powered by <span style={{ color: 'rgba(207,254,38,0.5)' }}>Rauts</span>
            </p>
          </div>
        </nav>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {selectedId === 'overview' ? (

            /* ── Overview page ── */
            <div className="max-w-3xl mx-auto px-4 py-8 sm:px-8 sm:py-12 space-y-10">
              {/* Hero */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold" style={{ color: '#F0F0F8' }}>{data.name}</h1>
                  <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{ background: 'rgba(207,254,38,0.1)', color: '#CFFE26', border: '1px solid rgba(207,254,38,0.25)' }}>
                    {data.version}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {data.description}
                </p>
              </div>

              {/* Base URL */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>Base URL</span>
                <code className="flex-1 text-[13px] font-mono" style={{ color: '#CFFE26' }}>{data.baseUrl}</code>
                <CopyButton text={data.baseUrl} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Endpoints',   value: totalEndpoints,         icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg> },
                  { label: 'Collections', value: data.folders.length,     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
                  { label: 'Version',     value: data.version,             icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg> },
                ].map(s => (
                  <div key={s.label} className="p-5 rounded-xl border" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                    <div className="flex items-center gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.icon}</div>
                    <div className="text-2xl font-bold mb-1" style={{ color: '#F0F0F8' }}>{s.value}</div>
                    <div className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Auth section */}
              <div className="space-y-3">
                <h2 className="text-[16px] font-semibold" style={{ color: '#F0F0F8' }}>Authentication</h2>
                <div className="p-5 rounded-xl border space-y-3" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    All protected endpoints require a <code className="px-1.5 py-0.5 rounded text-[12px]"
                      style={{ background: 'rgba(97,175,254,0.1)', color: '#61AFFE' }}>Bearer</code> token
                    passed in the <code className="px-1.5 py-0.5 rounded text-[12px]"
                      style={{ background: 'rgba(97,175,254,0.1)', color: '#61AFFE' }}>Authorization</code> header.
                    {authExampleEp ? (
                      <>
                        {' '}Obtain a token via{' '}
                        <button
                          type="button"
                          onClick={() => handleSelect(authExampleEp.id)}
                          className="underline underline-offset-2 transition-colors hover:text-white"
                          style={{ color: '#CFFE26' }}
                        >
                          {authExampleEp.method} {authExampleEp.path}
                        </button>
                        .
                      </>
                    ) : (
                      <> Use your identity provider or login flow as documented for this API.</>
                    )}
                  </p>
                  <pre className="px-4 py-3 rounded-lg text-[12px] font-mono" style={{ background: '#181818', color: '#ABB2BF', border: '1px solid #3A3A3A' }}>
                    {'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                  </pre>
                </div>
              </div>

              {/* Endpoint table */}
              <div className="space-y-3">
                <h2 className="text-[16px] font-semibold" style={{ color: '#F0F0F8' }}>All Endpoints</h2>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#3A3A3A' }}>
                  {data.folders.map((folder) => (
                    <div key={folder.name}>
                      <div className="px-5 py-2.5 border-b"
                        style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                        <span className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>{folder.name}</span>
                      </div>
                      {folder.endpoints.map((ep) => (
                        <button key={ep.id} onClick={() => handleSelect(ep.id)}
                          className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors border-b"
                          style={{ borderColor: '#2A2A2A', background: 'transparent' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#242424')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                          <MethodPill method={ep.method} size="md" />
                          <code className="text-[13px] font-mono flex-1 text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>{ep.path}</code>
                          <span className="text-[12px] truncate max-w-72" style={{ color: 'rgba(255,255,255,0.35)' }}>{ep.name}</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : selectedEp ? (

            /* ── Endpoint detail ── */
            <div className="max-w-3xl mx-auto px-4 py-8 sm:px-8 sm:py-10 space-y-8">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <button onClick={() => setSelectedId('overview')} className="hover:text-white transition-colors">
                  {data.name}
                </button>
                <span>/</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {data.folders.find(f => f.endpoints.some(e => e.id === selectedEp.id))?.name}
                </span>
                <span>/</span>
                <span style={{ color: '#E8E8F0' }}>{selectedEp.name}</span>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <MethodPill method={selectedEp.method} size="lg" />
                  <h1 className="text-2xl font-bold" style={{ color: '#F0F0F8' }}>{selectedEp.name}</h1>
                </div>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {selectedEp.description}
                </p>
              </div>

              {/* Endpoint URL */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                <MethodPill method={selectedEp.method} size="md" />
                <code className="flex-1 text-[13px] font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>{data.baseUrl}</span>
                  {selectedEp.path}
                </code>
                <CopyButton text={`${data.baseUrl}${selectedEp.path}`} />
              </div>

              {/* Path parameters */}
              {selectedEp.params.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Path Parameters</h2>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#3A3A3A' }}>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ background: '#242424', borderBottom: '1px solid #3A3A3A' }}>
                          {['Name', 'Type', 'Required', 'Description'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left font-semibold"
                              style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEp.params.map(p => (
                          <tr key={p.name} className="border-b" style={{ borderColor: '#2A2A2A' }}>
                            <td className="px-4 py-3">
                              <code className="text-[12px] font-mono" style={{ color: '#9CDCFE' }}>{p.name}</code>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] px-2 py-0.5 rounded"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                                {p.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {p.required
                                ? <span className="text-[11px] font-medium" style={{ color: '#F93E3E' }}>required</span>
                                : <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>optional</span>}
                            </td>
                            <td className="px-4 py-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {p.description}
                              {p.example && <><br /><code className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>e.g. {p.example}</code></>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Query parameters */}
              {selectedEp.query.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Query Parameters</h2>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#3A3A3A' }}>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ background: '#242424', borderBottom: '1px solid #3A3A3A' }}>
                          {['Name', 'Type', 'Required', 'Description'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left font-semibold"
                              style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEp.query.map(q => (
                          <tr key={q.name} className="border-b" style={{ borderColor: '#2A2A2A' }}>
                            <td className="px-4 py-3">
                              <code className="text-[12px] font-mono" style={{ color: '#9CDCFE' }}>{q.name}</code>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] px-2 py-0.5 rounded"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                                {q.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {q.required
                                ? <span className="text-[11px] font-medium" style={{ color: '#F93E3E' }}>required</span>
                                : <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>optional</span>}
                            </td>
                            <td className="px-4 py-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {q.description}
                              {q.example && (
                                <><br /><code className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>e.g. {q.example}</code></>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Request headers */}
              {selectedEp.headers.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Headers</h2>
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#3A3A3A' }}>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ background: '#242424', borderBottom: '1px solid #3A3A3A' }}>
                          {['Key', 'Value', 'Description'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left font-semibold"
                              style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEp.headers.map(h => (
                          <tr key={h.key} className="border-b" style={{ borderColor: '#2A2A2A' }}>
                            <td className="px-4 py-3"><code className="text-[12px] font-mono" style={{ color: '#9CDCFE' }}>{h.key}</code></td>
                            <td className="px-4 py-3"><code className="text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.55)' }}>{h.value}</code></td>
                            <td className="px-4 py-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.description ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Request body */}
              {selectedEp.body && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Request Body</h2>
                    <span className="text-[11px] px-2.5 py-1 rounded"
                      style={{ background: 'rgba(97,175,254,0.1)', color: '#61AFFE', border: '1px solid rgba(97,175,254,0.2)' }}>
                      application/json
                    </span>
                  </div>
                  {selectedEp.bodySchema && (
                    <div className="rounded-xl border overflow-hidden mb-3" style={{ borderColor: '#3A3A3A' }}>
                      <div className="px-4 py-2 border-b" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Schema</span>
                      </div>
                      {Object.entries(selectedEp.bodySchema).map(([key, type]) => (
                        <div key={key} className="flex items-start gap-4 px-4 py-2.5 border-b" style={{ borderColor: '#2A2A2A' }}>
                          <code className="text-[12px] font-mono w-48 shrink-0" style={{ color: '#9CDCFE' }}>{key}</code>
                          <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-xl overflow-hidden border" style={{ background: '#181818', borderColor: '#3A3A3A' }}>
                    <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Example</span>
                      <CopyButton text={selectedEp.body} />
                    </div>
                    <pre className="p-4 text-[12px] font-mono leading-[1.75] overflow-x-auto" style={{ color: '#ABB2BF' }}>
                      {selectedEp.body}
                    </pre>
                  </div>
                </section>
              )}

              {/* Responses */}
              <section className="space-y-3">
                <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Responses</h2>
                {/* Status tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedEp.scenarios.map((s, i) => (
                    <button key={i} onClick={() => setScenarioIdx(i)}
                      className="transition-colors"
                      style={{ outline: 'none' }}>
                      <StatusBadge code={s.status} />
                    </button>
                  ))}
                </div>
                {/* Active scenario */}
                {activeScenario && (
                  <div className="space-y-3">
                    {activeScenario.description && (
                      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {activeScenario.description}
                      </p>
                    )}
                    <div className="rounded-xl overflow-hidden border" style={{ background: '#181818', borderColor: '#3A3A3A' }}>
                      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: '#242424', borderColor: '#3A3A3A' }}>
                        <div className="flex items-center gap-2">
                          <StatusBadge code={activeScenario.status} />
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>application/json</span>
                        </div>
                        <CopyButton text={JSON.stringify(activeScenario.body, null, 2)} />
                      </div>
                      <pre className="p-4 text-[12px] font-mono leading-[1.75] overflow-x-auto">
                        <JsonView value={activeScenario.body} />
                      </pre>
                    </div>
                  </div>
                )}
              </section>

              {/* Code snippets */}
              <section className="space-y-3">
                <h2 className="text-[14px] font-semibold" style={{ color: '#F0F0F8' }}>Code Samples</h2>
                <CodeSnippet data={data} endpoint={selectedEp} />
              </section>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#3A3A3A' }}>
                {(() => {
                  const idx = allEndpoints.findIndex(e => e.id === selectedEp.id);
                  const prev = allEndpoints[idx - 1];
                  const next = allEndpoints[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => handleSelect(prev.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-colors"
                          style={{ background: '#242424', border: '1px solid #3A3A3A', color: 'rgba(255,255,255,0.5)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#E8E8F0')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                          {prev.name}
                        </button>
                      ) : <div />}
                      {next && (
                        <button onClick={() => handleSelect(next.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-colors"
                          style={{ background: '#242424', border: '1px solid #3A3A3A', color: 'rgba(255,255,255,0.5)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#E8E8F0')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}>
                          {next.name}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

          ) : null}
        </div>
      </div>
    </div>
  );
}
