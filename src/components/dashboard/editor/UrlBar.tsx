'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { MethodBadge } from '../MethodBadge';
import { IconChevronDown, IconCopy, IconSend } from '../icons';
import { endpointNumericId } from '@/lib/dashboard/ids';
import type { Method } from '@/types/dashboard-ui';

const HTTP_METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

export function UrlBar() {
  const {
    selectedEp,
    selectedEpId,
    pathDraft,
    pathDirty,
    methodDraft,
    methodDirty,
    setPathDrafts,
    setMethodDrafts,
    sendHttpRequest,
    sendBusy,
    saveEndpointRequestLine,
    savingEndpointRequestLine,
    resetEndpointRequestLineDrafts,
    resolvedRequestUrl,
  } = useDashboard();

  const [methodMenuOpen, setMethodMenuOpen] = useState(false);
  const methodMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!methodMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (methodMenuRef.current && !methodMenuRef.current.contains(e.target as Node)) {
        setMethodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [methodMenuOpen]);

  if (!selectedEp) return null;

  const editable = endpointNumericId(selectedEpId) != null;
  const requestLineDirty = pathDirty || methodDirty;

  return (
    <div
      className="flex flex-col gap-2 px-2 py-2 sm:flex-row sm:items-center sm:gap-2 sm:px-3 shrink-0 border-b"
      style={{ background: '#222', borderColor: '#3A3A3A' }}
    >
      <div
        className="flex items-center min-h-9 w-full flex-1 rounded-lg overflow-hidden border transition-colors focus-within:border-[#CFFE26]/50 sm:h-9 sm:min-h-0"
        style={{ background: '#2A2A2A', borderColor: '#444' }}
      >
        <div className="relative shrink-0" ref={methodMenuRef}>
          <button
            type="button"
            onClick={() => setMethodMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 h-9 border-r shrink-0 transition-colors hover:bg-white/5 select-none"
            style={{ borderColor: '#3A3A3A' }}
            aria-expanded={methodMenuOpen}
            aria-haspopup="listbox"
          >
            <MethodBadge method={methodDraft} size="md" />
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>
              <IconChevronDown />
            </span>
          </button>
          {methodMenuOpen && (
            <div
              className="absolute left-0 top-[calc(100%+4px)] z-40 min-w-[168px] rounded-lg border py-1 shadow-xl select-none"
              style={{
                background: '#252525',
                borderColor: '#444',
                boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
              }}
              role="listbox"
            >
              {HTTP_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="option"
                  aria-selected={m === methodDraft}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-white/5"
                  style={{
                    color: m === methodDraft ? '#CFFE26' : 'rgba(255,255,255,0.75)',
                    background: m === methodDraft ? 'rgba(207,254,38,0.06)' : 'transparent',
                  }}
                  onClick={() => {
                    setMethodDrafts((prev) => ({ ...prev, [selectedEpId]: m }));
                    setMethodMenuOpen(false);
                  }}
                >
                  <MethodBadge method={m} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className="flex-1 flex items-center px-3 gap-1 font-mono text-[13px] min-w-0"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          <span className="shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {'{{baseUrl}}'}
          </span>
          <input
            type="text"
            aria-label="Request path"
            className="flex-1 min-w-0 bg-transparent outline-none select-text"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            value={pathDraft}
            onChange={(e) =>
              setPathDrafts((prev) => ({ ...prev, [selectedEpId]: e.target.value }))
            }
          />
          {requestLineDirty && (
            <>
              {editable && (
                <button
                  type="button"
                  disabled={savingEndpointRequestLine}
                  onClick={() => void saveEndpointRequestLine()}
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border transition-colors hover:bg-[rgba(207,254,38,0.12)] disabled:opacity-40 select-none"
                  style={{ borderColor: '#CFFE26', color: '#CFFE26' }}
                >
                  {savingEndpointRequestLine ? 'Saving…' : 'Save'}
                </button>
              )}
              <button
                type="button"
                onClick={resetEndpointRequestLineDrafts}
                className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border transition-colors hover:bg-white/5 select-none"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.35)' }}
              >
                Reset
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard?.writeText(resolvedRequestUrl || '')
          }
          className="px-3 h-full flex items-center border-l transition-colors hover:text-white/60 select-none"
          style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.25)' }}
          title="Copy resolved URL"
        >
          <IconCopy />
        </button>
      </div>
      <button
        type="button"
        disabled={sendBusy}
        onClick={() => void sendHttpRequest()}
        className="flex w-full items-center justify-center gap-2 px-5 py-2.5 sm:py-0 sm:h-9 rounded-lg text-[13px] font-semibold text-black shrink-0 transition-colors hover:bg-[#d4e820] disabled:opacity-45 disabled:cursor-not-allowed select-none sm:w-auto"
        style={{ background: '#CFFE26' }}
      >
        <IconSend />
        {sendBusy ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
