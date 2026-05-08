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
    <div className="flex flex-col h-full">
      <div
        className="flex items-center px-3 h-9 shrink-0 border-b justify-between"
        style={{ borderColor: '#3A3A3A' }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Environments
        </span>
        <button
          type="button"
          title="Add environment"
          onClick={() => addWorkspaceEnvironment()}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <IconPlus />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col min-h-0">
        <div className="shrink-0 space-y-0.5 mb-3">
          {workspaceEnvironments.length === 0 && (
            <p className="text-[12px] px-2 py-4 italic text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRenamingEnvId(null);
                    setActiveWorkspaceEnvironment(env.id);
                  }
                }}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors group/env"
                style={{
                  background: active ? 'rgba(207,254,38,0.07)' : 'transparent',
                  border: active ? '1px solid rgba(207,254,38,0.12)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: env.color }} />
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
                    className="flex-1 min-w-0 px-2 py-1 rounded border text-[12px] outline-none"
                    style={{
                      background: '#1A1A1A',
                      borderColor: '#3A3A3A',
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  />
                ) : (
                  <span
                    className="flex-1 text-[12px] truncate text-left"
                    style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)' }}
                  >
                    {env.name}
                  </span>
                )}
                {!renaming && (
                  <>
                    <button
                      type="button"
                      title="Rename"
                      className="p-1 rounded opacity-0 group-hover/env:opacity-100 hover:bg-white/10 transition-opacity"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        beginRename(env.id, env.name);
                      }}
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      title={singleEnvironment ? 'Cannot remove the last environment' : 'Remove'}
                      disabled={singleEnvironment}
                      className="p-1 rounded opacity-0 group-hover/env:opacity-100 transition-opacity disabled:opacity-25 hover:bg-white/10"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!singleEnvironment) removeWorkspaceEnvironment(env.id);
                      }}
                    >
                      <IconTrash />
                    </button>
                  </>
                )}
                {active && !renaming && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(207,254,38,0.1)', color: '#CFFE26' }}
                  >
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden" style={{ borderColor: '#3A3A3A' }}>
          <div
            className="flex items-center justify-between px-3 py-2 border-b shrink-0"
            style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Variables
              {activeWorkspaceEnvironment && (
                <span className="font-normal normal-case ml-2 opacity-60">({activeWorkspaceEnvironment.name})</span>
              )}
            </p>
            <button
              type="button"
              disabled={!activeWorkspaceEnvironment}
              onClick={() => addWorkspaceVariable()}
              className="text-[11px] font-semibold px-2 py-1 rounded border transition-colors hover:bg-white/5 disabled:opacity-30"
              style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
            >
              + Add
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {!activeWorkspaceEnvironment ? (
              <p className="text-[12px] italic px-2 py-4 text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Select an environment
              </p>
            ) : (
              activeWorkspaceEnvironment.variables.map((row) => {
                const lockBase = isBaseUrlVariableKey(row.key);
                return (
                  <div key={row.id} className="grid grid-cols-1 gap-1.5 p-2 rounded-md" style={{ background: '#242424' }}>
                    <div className="flex gap-2">
                      <input
                        placeholder="variable_key"
                        value={lockBase ? 'baseUrl' : row.key}
                        readOnly={lockBase}
                        disabled={lockBase}
                        onChange={(e) =>
                          updateWorkspaceVariable(row.id, { key: e.target.value })
                        }
                        className="flex-1 min-w-0 px-2 py-1.5 rounded border text-[11px] font-mono outline-none disabled:opacity-90"
                        style={{
                          background: '#181818',
                          borderColor: '#3A3A3A',
                          color: lockBase ? '#61AFFE' : 'rgba(255,255,255,0.7)',
                        }}
                      />
                      <button
                        type="button"
                        title={lockBase ? 'baseUrl cannot be removed' : 'Remove variable'}
                        disabled={lockBase}
                        className="shrink-0 px-2 py-1 rounded border text-[11px] disabled:opacity-25 hover:bg-white/5"
                        style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.45)' }}
                        onClick={() => removeWorkspaceVariable(row.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                    <input
                      placeholder="value"
                      value={row.value}
                      onChange={(e) =>
                        updateWorkspaceVariable(row.id, { value: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded border text-[11px] font-mono outline-none"
                      style={{
                        background: '#181818',
                        borderColor: '#3A3A3A',
                        color: 'rgba(255,255,255,0.65)',
                      }}
                    />
                    {lockBase && (
                      <p className="text-[10px] px-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        Required — maps to {'{{baseUrl}}'} in requests.
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
