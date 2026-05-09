'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '../DashboardContext';
import { IconEdit, IconPlus, IconTrash } from '../icons';
import { isBaseUrlVariableKey } from '@/lib/dashboard/workspace-environments';

export function EnvironmentPanel() {
  const {
    workspaceEnvironments,
    activeWorkspaceEnvironmentId,
    activeWorkspaceEnvironment,
    setActiveWorkspaceEnvironment,
    addWorkspaceEnvironment,
    removeWorkspaceEnvironment,
    renameWorkspaceEnvironment,
    addWorkspaceVariable,
    removeWorkspaceVariable,
    updateWorkspaceVariable,
  } = useDashboard();

  const [renamingEnvId, setRenamingEnvId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'variables'>('list');

  useEffect(() => {
    if (!renamingEnvId) return;
    const env = workspaceEnvironments.find((e) => e.id === renamingEnvId);
    if (!env) setRenamingEnvId(null);
  }, [renamingEnvId, workspaceEnvironments]);

  const beginRename = (envId: string, currentName: string) => {
    setRenamingEnvId(envId);
    setRenameDraft(currentName);
  };

  const commitRename = () => {
    if (!renamingEnvId) return;
    const trimmed = renameDraft.trim();
    if (trimmed) renameWorkspaceEnvironment(renamingEnvId, trimmed);
    setRenamingEnvId(null);
    setRenameDraft('');
  };

  const singleEnvironment = workspaceEnvironments.length <= 1;

  return (
    <div className="flex h-full w-full overflow-hidden text-white relative" style={{ background: '#141414' }}>
      {/* LEFT COLUMN: Environments List */}
      <div
        className={`${
          activeView === 'list' ? 'flex' : 'hidden'
        } md:flex w-full md:w-80 h-full border-r flex-col shrink-0`}
        style={{ borderColor: '#262626', background: '#1A1A1A' }}
      >
        <div
          className="flex items-center px-6 h-16 shrink-0 border-b justify-between"
          style={{ borderColor: '#262626' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] font-bold uppercase tracking-wider text-white/50"
            >
              Environments
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/10 text-white/70">
              {workspaceEnvironments.length}
            </span>
          </div>
          <button
            type="button"
            title="Create new environment"
            onClick={() => addWorkspaceEnvironment()}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all border hover:border-[#CFFE26] hover:bg-[#CFFE26]/5"
            style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
          >
            <IconPlus /> Add
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {workspaceEnvironments.length === 0 && (
            <p className="text-[12px] px-3 py-6 italic text-center text-white/20">
              Loading environments…
            </p>
          )}
          {workspaceEnvironments.map((env) => {
            const active = env.id === activeWorkspaceEnvironmentId;
            const renaming = renamingEnvId === env.id;
            return (
              <div
                key={env.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setRenamingEnvId(null);
                  setActiveWorkspaceEnvironment(env.id);
                  setActiveView('variables');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRenamingEnvId(null);
                    setActiveWorkspaceEnvironment(env.id);
                    setActiveView('variables');
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 group/env"
                style={{
                  background: active ? 'rgba(207,254,38,0.06)' : 'transparent',
                  border: active ? '1px solid rgba(207,254,38,0.18)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ background: env.color }}
                />
                
                {renaming ? (
                  <input
                    autoFocus
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        commitRename();
                      }
                      if (e.key === 'Escape') {
                        setRenamingEnvId(null);
                        setRenameDraft('');
                      }
                    }}
                    onBlur={() => commitRename()}
                    className="flex-1 min-w-0 px-2 py-1 rounded-md border text-[13px] outline-none font-medium"
                    style={{
                      background: '#141414',
                      borderColor: '#3A3A3A',
                      color: '#FFF',
                    }}
                  />
                ) : (
                  <span
                    className="flex-1 text-[13px] font-medium truncate text-left"
                    style={{ color: active ? '#FFF' : 'rgba(255,255,255,0.6)' }}
                  >
                    {env.name}
                  </span>
                )}

                {!renaming && (
                  <div className="flex items-center gap-1 opacity-0 group-hover/env:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Rename environment"
                      className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        beginRename(env.id, env.name);
                      }}
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      title={singleEnvironment ? 'Cannot remove the last environment' : 'Delete environment'}
                      disabled={singleEnvironment}
                      className="p-1 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!singleEnvironment) removeWorkspaceEnvironment(env.id);
                      }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                )}
                {active && !renaming && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider uppercase shrink-0"
                    style={{ background: 'rgba(207,254,38,0.1)', color: '#CFFE26' }}
                  >
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Variables Table & Configuration */}
      <div className={`${
        activeView === 'variables' ? 'flex' : 'hidden'
      } md:flex flex-1 flex-col h-full overflow-hidden p-4 sm:p-8 lg:p-12`}>
        {!activeWorkspaceEnvironment ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto p-4">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="md:hidden mb-6 flex items-center gap-1.5 text-xs font-bold text-[#CFFE26] bg-[#CFFE26]/5 px-3 py-1.5 rounded-lg border border-[#CFFE26]/20"
            >
              ← Back to Environments
            </button>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-white/5 border border-white/10 mx-auto">
              <span className="text-3xl">⚙️</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No Active Environment</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Please select or create an environment from the left sidebar to start managing workspace-specific environment variables.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header Area */}
            <div className="shrink-0 flex flex-col gap-4 pb-6 border-b border-[#262626]">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="md:hidden self-start flex items-center gap-1.5 text-xs font-bold text-[#CFFE26] bg-[#CFFE26]/5 px-3 py-1.5 rounded-lg border border-[#CFFE26]/20"
              >
                ← Back to Environments
              </button>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {activeWorkspaceEnvironment.name} Variables
                    </h1>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: activeWorkspaceEnvironment.color }}
                    />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-white/40 leading-relaxed max-w-3xl">
                    Configure environment variables to securely store and swap credentials or endpoints. 
                    Reference them in your paths, headers, or parameters like <code className="text-[#CFFE26] bg-[#CFFE26]/5 px-1.5 py-0.5 rounded font-mono text-[11px]">{`{{variable_key}}`}</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Variables Card Table */}
            <div
              className="flex-1 mt-8 border rounded-2xl bg-[#1A1A1A] overflow-hidden flex flex-col min-h-0"
              style={{ borderColor: '#262626' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                style={{ background: '#202020', borderColor: '#262626' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-white/50">
                    Active Variables
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 font-bold text-white/40">
                    {activeWorkspaceEnvironment.variables.length} defined
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => addWorkspaceVariable()}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-md border transition-all hover:bg-[#CFFE26] hover:text-black"
                  style={{ borderColor: '#CFFE26', color: '#CFFE26' }}
                >
                  + Add Variable
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {activeWorkspaceEnvironment.variables.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <span className="text-xl mb-2">💡</span>
                    <p className="text-[13px] text-white/30 font-medium">No variables defined for this environment.</p>
                    <p className="text-[11px] text-white/20 mt-1">Click the &ldquo;Add Variable&rdquo; button above to create one.</p>
                  </div>
                ) : (
                  activeWorkspaceEnvironment.variables.map((row) => {
                    const lockBase = isBaseUrlVariableKey(row.key);
                    return (
                      <div
                        key={row.id}
                        className="flex flex-col md:flex-row gap-3 items-stretch md:items-center p-3.5 rounded-xl border transition-all"
                        style={{ background: '#141414', borderColor: '#262626' }}
                      >
                        {/* KEY INPUT */}
                        <div className="flex-1 md:w-1/3 min-w-0">
                          <input
                            placeholder="Variable Key"
                            value={lockBase ? 'baseUrl' : row.key}
                            readOnly={lockBase}
                            disabled={lockBase}
                            onChange={(e) =>
                              updateWorkspaceVariable(row.id, { key: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border text-[12px] font-mono font-semibold outline-none transition-all focus:border-[#CFFE26]/40"
                            style={{
                              background: '#191919',
                              borderColor: '#2D2D2D',
                              color: lockBase ? '#61AFFE' : '#FFF',
                            }}
                          />
                        </div>

                        {/* VALUE INPUT */}
                        <div className="flex-2 md:flex-1 min-w-0">
                          <input
                            placeholder="Variable Value"
                            value={row.value}
                            onChange={(e) =>
                              updateWorkspaceVariable(row.id, { value: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-lg border text-[12px] font-mono outline-none transition-all focus:border-[#CFFE26]/40"
                            style={{
                              background: '#191919',
                              borderColor: '#2D2D2D',
                              color: 'rgba(255,255,255,0.85)',
                            }}
                          />
                        </div>

                        {/* ACTIONS */}
                        <div className="shrink-0 flex items-center md:justify-center">
                          <button
                            type="button"
                            title={lockBase ? 'baseUrl is a core variable and cannot be deleted' : 'Delete variable'}
                            disabled={lockBase}
                            className="p-2.5 rounded-lg border text-[12px] disabled:opacity-20 hover:bg-red-500/10 hover:text-red-400 transition-all"
                            style={{ borderColor: '#2D2D2D', color: 'rgba(255,255,255,0.4)' }}
                            onClick={() => removeWorkspaceVariable(row.id)}
                          >
                            <IconTrash />
                          </button>
                        </div>

                        {lockBase && (
                          <div className="md:hidden text-[10px] px-1 text-white/30">
                            Required — maps to <code className="font-mono text-[#61AFFE]">{`{{baseUrl}}`}</code> in requests.
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Optional footnote for Lock Base key */}
                {activeWorkspaceEnvironment.variables.some((r) => isBaseUrlVariableKey(r.key)) && (
                  <p className="text-[11px] text-white/20 px-2 mt-4 flex items-center gap-1.5 font-medium">
                    <span className="text-[#61AFFE]">•</span>
                    The <code className="text-[#61AFFE] font-mono">baseUrl</code> variable is a required endpoint root that automatically maps to your active collection's target server.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
