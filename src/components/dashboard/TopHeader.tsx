'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RautsLogo } from '@/components/common/Logo';
import { profileInitials } from '@/lib/userDisplay';
import { useDashboard } from './DashboardContext';
import { projectIdFromCollectionId } from '@/lib/dashboard/ids';
import { IconChevronDown, IconDoc, IconMenu, IconPlus } from './icons';

export function TopHeader() {
  const {
    user,
    selectedCol,
    selectedEp,
    workspaceEnvironments,
    activeWorkspaceEnvironment,
    activeWorkspaceEnvironmentId,
    setActiveWorkspaceEnvironment,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setManualCreateModal,
    setManualCreateName,
    setManualCreatePath,
    setManualCreateMethod,
  } = useDashboard();

  const openNewCollection = () => {
    setManualCreateModal({ kind: 'collection' });
    setManualCreateName('');
    setManualCreatePath('/');
    setManualCreateMethod('GET');
  };
  const projectId = selectedCol ? projectIdFromCollectionId(selectedCol.id) : null;

  const [envMenuOpen, setEnvMenuOpen] = useState(false);
  const envMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!envMenuOpen) return;
    const close = (e: MouseEvent) => {
      const node = envMenuRef.current;
      if (node && e.target instanceof Node && !node.contains(e.target)) {
        setEnvMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [envMenuOpen]);

  return (
    <header
      className="h-10.5 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 shrink-0 border-b z-[60]"
      style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}
    >
      <button
        type="button"
        className="md:hidden flex items-center justify-center w-9 h-9 rounded shrink-0 transition-colors hover:bg-white/10"
        style={{ color: 'rgba(255,255,255,0.65)' }}
        aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileSidebarOpen}
        onClick={() => setMobileSidebarOpen((o) => !o)}
      >
        <IconMenu size={20} />
      </button>
      <Link
        href="/"
        className="flex items-center gap-2 mr-0 sm:mr-1 min-w-0 hover:opacity-85 transition-opacity"
      >
        <RautsLogo className="w-5 h-5 shrink-0" />
        <span
          className="text-[13px] font-semibold truncate max-w-[4rem] sm:max-w-none"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          Rauts
        </span>
      </Link>
      <div className="w-px h-5 shrink-0 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Breadcrumb shortcut */}
      <div
        className="hidden lg:flex items-center gap-1.5 text-[12px] min-w-0 flex-1"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <span>/</span>
        <span className="truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {selectedCol?.name ?? 'Collections'}
        </span>
        {selectedEp && (
          <>
            <span>/</span>
            <span className="truncate max-w-[140px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {selectedEp.name}
            </span>
          </>
        )}
      </div>

      <div className="flex-1 min-w-0 lg:hidden" />

      {/* Published docs link */}
      <a
        href={projectId != null ? `/docs/${projectId}` : '/docs'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded text-[12px] transition-colors hover:bg-white/10 shrink-0"
        style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
        title={projectId != null ? 'Documentation for this collection' : 'Sample documentation'}
      >
        <IconDoc />
        <span className="hidden sm:inline">View Docs</span>
      </a>

      {/* Environment picker */}
      <div className="relative shrink-0 min-w-0" ref={envMenuRef}>
        <button
          type="button"
          onClick={() => setEnvMenuOpen((o) => !o)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded border text-[12px] transition-colors hover:border-[#CFFE26]/40 max-w-[100px] sm:max-w-[200px]"
          style={{ background: '#383838', borderColor: '#4A4A4A', color: 'rgba(255,255,255,0.55)' }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: activeWorkspaceEnvironment?.color ?? '#888' }}
          />
          <span className="truncate min-w-0 flex-1 text-left">
            {activeWorkspaceEnvironment?.name ?? 'Environment'}
          </span>
          <IconChevronDown />
        </button>
        {envMenuOpen && (
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-80 min-w-[220px] max-h-[min(320px,70vh)] overflow-y-auto rounded-lg border py-1 shadow-xl"
            style={{
              background: '#2C2C2C',
              borderColor: '#3A3A3A',
              boxShadow: '0 14px 48px rgba(0,0,0,0.5)',
            }}
          >
            {workspaceEnvironments.length === 0 ? (
              <p className="px-3 py-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Loading…
              </p>
            ) : (
              workspaceEnvironments.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceEnvironment(env.id);
                    setEnvMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors hover:bg-white/6"
                  style={{
                    background:
                      env.id === activeWorkspaceEnvironmentId
                        ? 'rgba(207,254,38,0.07)'
                        : 'transparent',
                    color:
                      env.id === activeWorkspaceEnvironmentId
                        ? '#CFFE26'
                        : 'rgba(255,255,255,0.78)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: env.color }} />
                  <span className="truncate">{env.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* New collection */}
      <button
        type="button"
        onClick={openNewCollection}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded text-[12px] font-semibold text-black transition-colors hover:bg-[#d4e820] shrink-0"
        style={{ background: '#CFFE26' }}
        title="Create a new collection"
      >
        <IconPlus size={11} strokeWidth={3} />
        <span className="hidden sm:inline">New collection</span>
      </button>

      {/* Avatar → profile */}
      <Link
        href="/dashboard/profile"
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer ml-0.5 shrink-0 no-underline"
        style={{
          background: 'rgba(207,254,38,0.15)',
          border: '1px solid rgba(207,254,38,0.35)',
          color: '#CFFE26',
        }}
        title="Profile"
      >
        {profileInitials(user)}
      </Link>
    </header>
  );
}
