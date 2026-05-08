'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import {
  buildFolderOverviewsForSave,
  loadUserDashboardCollections,
  normalizeMethod,
} from '@/lib/dashboard-collections';
import type {
  Method,
  Scenario,
  UiCollection as Collection,
  UiEndpoint,
} from '@/types/dashboard-ui';
import { projectIdFromCollectionId, endpointNumericId } from '@/lib/dashboard/ids';
import { buildDashboardFetchRequest } from '@/lib/dashboard/build-dashboard-fetch';
import type { LiveHttpResponse } from '@/types/live-http';
import type {
  AuthConfig,
  FormDataFieldRow,
  ManualHeaderRow,
  ManualParamRow,
} from '@/types/request-draft';
import { defaultAuthConfig } from '@/types/request-draft';
import {
  REQUEST_HISTORY_MAX,
  loadRequestHistory,
  mergeRequestHistoryById,
  saveRequestHistory,
  findEndpointSidebarLocation,
  type DashboardHistoryEntry,
} from '@/lib/dashboard/request-history';
import {
  clearBackendRequestHistory,
  fetchBackendRequestHistory,
  pushBackendRequestHistoryEntry,
} from '@/lib/dashboard/request-history-api';
import {
  colorForIndex,
  createDefaultWorkspaceEnvironments,
  isBaseUrlVariableKey,
  loadWorkspaceEnvironments,
  newRowId,
  normalizeEnvironmentVariables,
  resolveRequestDisplayUrl,
  saveWorkspaceEnvironments,
  variablesToRecord,
  type WorkspaceEnvironment,
  type WorkspaceEnvVariableRow,
} from '@/lib/dashboard/workspace-environments';

export type ReqBodyMode = 'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded';
export type ResBodyView = 'pretty' | 'raw' | 'none';
export type SidebarTab = 'Collections' | 'Environment' | 'History' | 'GitHub';

export type ManualCreateModal =
  | null
  | { kind: 'collection' }
  | { kind: 'folder'; colId: string }
  | { kind: 'request'; colId: string; folderName: string };

export function useDashboardState() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userEnvKey = user ? String(user.id) : 'anon';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [listReady, setListReady] = useState(false);

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('Collections');
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedColId, setSelectedColId] = useState<string>('');
  const [selectedEpId, setSelectedEpId] = useState<string>('');
  const [reqTab, setReqTab] = useState('Params');
  const [resTab, setResTab] = useState('Body');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [reqBodyMode, setReqBodyMode] = useState<ReqBodyMode>('raw');
  const [resBodyView, setResBodyView] = useState<ResBodyView>('pretty');
  const [bodyRawDrafts, setBodyRawDrafts] = useState<Record<string, string>>({});
  const [pathDrafts, setPathDrafts] = useState<Record<string, string>>({});
  const [methodDrafts, setMethodDrafts] = useState<Record<string, Method>>({});
  const [cellDrafts, setCellDrafts] = useState<Record<string, string>>({});
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);
  const [deleteConfirmCol, setDeleteConfirmCol] = useState<Collection | null>(null);
  /** When set with no endpoint selected, main pane shows folder-level AI overview. */
  const [selectedFolder, setSelectedFolder] = useState<{ colId: string; name: string } | null>(null);
  const [colNameDraft, setColNameDraft] = useState('');
  const [colDescDraft, setColDescDraft] = useState('');
  const [folderOverviewDraft, setFolderOverviewDraft] = useState('');
  const [savingCollectionMeta, setSavingCollectionMeta] = useState(false);
  const [savingFolderOverview, setSavingFolderOverview] = useState(false);
  const [editingCollectionOverview, setEditingCollectionOverview] = useState(false);
  const [editingFolderOverview, setEditingFolderOverview] = useState(false);
  const [folderNameDraft, setFolderNameDraft] = useState('');
  const [editingEndpointName, setEditingEndpointName] = useState(false);
  const [endpointNameDraft, setEndpointNameDraft] = useState('');
  const [savingEndpointName, setSavingEndpointName] = useState(false);
  const [savingEndpointRequestLine, setSavingEndpointRequestLine] = useState(false);
  const [colDocsPublished, setColDocsPublished] = useState(false);
  const [colDocsBaseUrl, setColDocsBaseUrl] = useState('');
  const [savingPublishDocs, setSavingPublishDocs] = useState(false);

  const [manualCreateModal, setManualCreateModal] = useState<ManualCreateModal>(null);
  const [manualCreateName, setManualCreateName] = useState('');
  const [manualCreatePath, setManualCreatePath] = useState('/');
  const [manualCreateMethod, setManualCreateMethod] = useState('GET');
  const [manualCreateBusy, setManualCreateBusy] = useState(false);

  const [manualPathRowsByEp, setManualPathRowsByEp] = useState<Record<string, ManualParamRow[]>>({});
  const [manualQueryRowsByEp, setManualQueryRowsByEp] = useState<Record<string, ManualParamRow[]>>({});
  const [manualHeaderRowsByEp, setManualHeaderRowsByEp] = useState<Record<string, ManualHeaderRow[]>>({});
  const [formDataRowsByEp, setFormDataRowsByEp] = useState<Record<string, FormDataFieldRow[]>>({});
  const [urlEncodedRowsByEp, setUrlEncodedRowsByEp] = useState<Record<string, ManualHeaderRow[]>>({});
  const [authByEp, setAuthByEp] = useState<Record<string, AuthConfig>>({});

  const [liveHttpResponse, setLiveHttpResponse] = useState<LiveHttpResponse | null>(null);
  const [sendBusy, setSendBusy] = useState(false);
  const [savingLiveExample, setSavingLiveExample] = useState(false);
  const [requestHistory, setRequestHistory] = useState<DashboardHistoryEntry[]>([]);
  const sendBusyRef = useRef(false);
  /** Bumps when clearing history or switching users so stale GET responses are ignored. */
  const historySyncGen = useRef(0);

  type SendSnapshot = {
    selectedEp: UiEndpoint | null;
    selectedEpId: string;
    pathDraft: string;
    methodDraft: Method;
    rawBodyDraft: string;
    reqBodyMode: ReqBodyMode;
    activeEnvironmentVariablesRecord: Record<string, string>;
    cellDrafts: Record<string, string>;
    manualPathRowsByEp: Record<string, ManualParamRow[]>;
    manualQueryRowsByEp: Record<string, ManualParamRow[]>;
    manualHeaderRowsByEp: Record<string, ManualHeaderRow[]>;
    formDataRowsByEp: Record<string, FormDataFieldRow[]>;
    urlEncodedRowsByEp: Record<string, ManualHeaderRow[]>;
    authByEp: Record<string, AuthConfig>;
  };
  const latestSendRef = useRef<SendSnapshot | null>(null);

  const [workspaceEnvironments, setWorkspaceEnvironments] = useState<WorkspaceEnvironment[]>([]);
  const [activeWorkspaceEnvironmentId, setActiveWorkspaceEnvironmentId] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const closeIfWide = () => {
      if (mq.matches) setMobileSidebarOpen(false);
    };
    closeIfWide();
    mq.addEventListener('change', closeIfWide);
    return () => mq.removeEventListener('change', closeIfWide);
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!selectedColId) {
      const defaults = createDefaultWorkspaceEnvironments();
      setWorkspaceEnvironments(defaults);
      setActiveWorkspaceEnvironmentId(defaults[0]!.id);
      return;
    }
    const loaded = loadWorkspaceEnvironments(userEnvKey, selectedColId);
    if (loaded) {
      setWorkspaceEnvironments(loaded.environments);
      setActiveWorkspaceEnvironmentId(loaded.activeEnvironmentId);
      return;
    }
    const defaults = createDefaultWorkspaceEnvironments();
    setWorkspaceEnvironments(defaults);
    setActiveWorkspaceEnvironmentId(defaults[0]!.id);
  }, [userEnvKey, selectedColId]);

  useEffect(() => {
    if (!user?.id) {
      setRequestHistory(loadRequestHistory(userEnvKey));
      return;
    }
    const gen = ++historySyncGen.current;
    let cancelled = false;
    void (async () => {
      try {
        const entries = await fetchBackendRequestHistory();
        if (cancelled || gen !== historySyncGen.current) return;
        setRequestHistory((prev) => mergeRequestHistoryById(entries, prev));
      } catch {
        if (!cancelled && gen === historySyncGen.current) {
          setRequestHistory([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, userEnvKey]);

  useEffect(() => {
    if (!selectedColId || workspaceEnvironments.length === 0 || !activeWorkspaceEnvironmentId) return;
    saveWorkspaceEnvironments(userEnvKey, selectedColId, {
      environments: workspaceEnvironments,
      activeEnvironmentId: activeWorkspaceEnvironmentId,
    });
  }, [userEnvKey, selectedColId, workspaceEnvironments, activeWorkspaceEnvironmentId]);

  const refreshCollections = useCallback(async () => {
    const list = await loadUserDashboardCollections();
    setCollections(list);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (!sp.has('github') && !sp.has('github_error')) return;
    const err = sp.get('github_error');
    const connected = sp.get('github') === 'connected';
    sp.delete('github');
    sp.delete('github_error');
    const path = window.location.pathname;
    const next = sp.toString();
    window.history.replaceState({}, '', next ? `${path}?${next}` : path);
    if (err) {
      window.alert(`GitHub: ${decodeURIComponent(err)}`);
      return;
    }
    if (connected) {
      void refreshCollections();
    }
  }, [refreshCollections]);

  const openDeleteCollectionModal = (col: Collection, ev?: React.MouseEvent) => {
    ev?.stopPropagation();
    if (projectIdFromCollectionId(col.id) == null) return;
    const full = collections.find((c) => c.id === col.id) ?? col;
    setDeleteConfirmCol(full);
  };

  const confirmDeleteCollection = async () => {
    const full = deleteConfirmCol;
    if (!full) return;
    const projectId = projectIdFromCollectionId(full.id);
    if (projectId == null) {
      setDeleteConfirmCol(null);
      return;
    }
    setDeletingCollectionId(full.id);
    const epIds = new Set(full.folders.flatMap((f) => f.endpoints.map((ep) => ep.id)));
    try {
      await api.delete(`/projects/${projectId}`);
      setOpenTabs((prev) => prev.filter((id) => !epIds.has(id)));
      setCollections((prev) => prev.filter((c) => c.id !== full.id));
      setExpandedCols((prev) => {
        const next = { ...prev };
        delete next[full.id];
        return next;
      });
      setExpandedFolders((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (k.startsWith(`${full.id}-`)) delete next[k];
        }
        return next;
      });
      if (selectedColId === full.id) {
        setSelectedColId('');
        setSelectedEpId('');
        setSelectedFolder(null);
      }
      if (selectedFolder?.colId === full.id) {
        setSelectedFolder(null);
      }
      if (selectedEpId && epIds.has(selectedEpId)) {
        setSelectedEpId('');
      }
      setDeleteConfirmCol(null);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not delete collection');
    } finally {
      setDeletingCollectionId(null);
    }
  };

  useEffect(() => {
    if (!deleteConfirmCol) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deletingCollectionId) setDeleteConfirmCol(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteConfirmCol, deletingCollectionId]);

  useEffect(() => {
    if (!manualCreateModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !manualCreateBusy) {
        setManualCreateModal(null);
        setManualCreateName('');
        setManualCreatePath('/');
        setManualCreateMethod('GET');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [manualCreateModal, manualCreateBusy]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const list = await loadUserDashboardCollections();
        if (!cancelled) setCollections(list);
      } catch (e: unknown) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load projects');
      } finally {
        if (!cancelled) setListReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!collections.length) return;
    setExpandedCols((prev) => {
      const next = { ...prev };
      for (const c of collections) {
        if (next[c.id] === undefined) next[c.id] = true;
      }
      return next;
    });
    setExpandedFolders((prev) => {
      const next = { ...prev };
      for (const c of collections) {
        for (const f of c.folders) {
          const k = `${c.id}-${f.name}`;
          if (next[k] === undefined) next[k] = true;
        }
      }
      return next;
    });
  }, [collections]);

  useEffect(() => {
    if (!collections.length) {
      setSelectedColId('');
      setSelectedEpId('');
      setOpenTabs([]);
      return;
    }
    const all = collections.flatMap((c) => c.folders.flatMap((f) => f.endpoints));
    if (!all.length) {
      setSelectedColId(collections[0].id);
      setSelectedEpId('');
      setOpenTabs([]);
      return;
    }
    // Empty endpoint id means "collection overview" — do not auto-select the first request.
    if (!selectedEpId) {
      if (!selectedColId) {
        setSelectedColId(collections[0].id);
      }
      return;
    }
    const exists = all.some((e) => e.id === selectedEpId);
    if (exists) return;
    const first = all[0];
    const col = collections.find((c) => c.folders.some((f) => f.endpoints.some((e) => e.id === first.id)));
    if (col) setSelectedColId(col.id);
    setSelectedEpId(first.id);
    setOpenTabs([first.id]);
    setScenarioIdx(0);
  }, [collections, selectedEpId, selectedColId]);

  const selectedCol = collections.find((c) => c.id === selectedColId);
  const allEndpoints = collections.flatMap((c) => c.folders.flatMap((f) => f.endpoints));
  const selectedEp = allEndpoints.find((e) => e.id === selectedEpId) ?? null;
  const selectedFolderView =
    selectedFolder && !selectedEp
      ? (() => {
          const col = collections.find((c) => c.id === selectedFolder.colId);
          const folder = col?.folders.find((f) => f.name === selectedFolder.name);
          if (!col || !folder) return null;
          return { col, folder };
        })()
      : null;

  useEffect(() => {
    if (selectedEp || selectedFolderView || !selectedCol) return;
    setColNameDraft(selectedCol.name);
    setColDescDraft(selectedCol.description ?? '');
  }, [
    selectedEp,
    selectedFolderView,
    selectedColId,
    selectedCol?.name,
    selectedCol?.description,
  ]);

  useEffect(() => {
    if (selectedEp || selectedFolderView || !selectedCol) return;
    setColDocsPublished(Boolean(selectedCol.docsPublished));
    setColDocsBaseUrl(selectedCol.docsBaseUrl ?? '');
  }, [
    selectedEp,
    selectedFolderView,
    selectedColId,
    selectedCol?.docsPublished,
    selectedCol?.docsBaseUrl,
  ]);

  useEffect(() => {
    if (selectedFolderView) {
      setFolderOverviewDraft(selectedFolderView.folder.overview ?? '');
      setFolderNameDraft(selectedFolderView.folder.name);
    }
  }, [selectedFolderView?.col.id, selectedFolderView?.folder.name, selectedFolderView?.folder.overview]);

  useEffect(() => {
    setEditingCollectionOverview(false);
  }, [selectedColId, selectedFolderView, selectedEpId]);

  useEffect(() => {
    setEditingFolderOverview(false);
  }, [selectedFolder?.colId, selectedFolder?.name, selectedEpId]);

  useEffect(() => {
    setEditingEndpointName(false);
  }, [selectedEpId]);

  const savePublishDocs = async () => {
    if (!selectedCol) return;
    const id = projectIdFromCollectionId(selectedCol.id);
    if (id == null) return;
    setSavingPublishDocs(true);
    try {
      await api.post('/projects/update', {
        id,
        docsPublished: colDocsPublished,
        docsBaseUrl: colDocsBaseUrl.trim(),
      });
      setCollections((prev) =>
        prev.map((c) =>
          c.id === selectedCol.id
            ? {
                ...c,
                docsPublished: colDocsPublished,
                docsBaseUrl: colDocsBaseUrl.trim() || undefined,
              }
            : c,
        ),
      );
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not save publish settings');
    } finally {
      setSavingPublishDocs(false);
    }
  };

  const saveCollectionOverview = async () => {
    if (!selectedCol) return;
    const id = projectIdFromCollectionId(selectedCol.id);
    if (id == null) return;
    const name = colNameDraft.trim();
    if (!name) {
      window.alert('Collection name cannot be empty.');
      return;
    }
    setSavingCollectionMeta(true);
    try {
      await api.post('/projects/update', {
        id,
        name,
        description: colDescDraft,
      });
      setCollections((prev) =>
        prev.map((c) => (c.id === selectedCol.id ? { ...c, name, description: colDescDraft } : c)),
      );
      setEditingCollectionOverview(false);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not save collection');
    } finally {
      setSavingCollectionMeta(false);
    }
  };

  const saveFolderOverview = async () => {
    if (!selectedFolderView) return;
    const id = projectIdFromCollectionId(selectedFolderView.col.id);
    if (id == null) return;
    const { col, folder } = selectedFolderView;
    const oldName = folder.name;
    const newName = folderNameDraft.trim();
    if (!newName) {
      window.alert('Folder name cannot be empty.');
      return;
    }
    if (newName !== oldName && col.folders.some((f) => f.name === newName)) {
      window.alert('Another folder already uses that name.');
      return;
    }
    const oldKey = `${col.id}-${oldName}`;
    setSavingFolderOverview(true);
    try {
      if (newName !== oldName) {
        await api.post('/projects/folder/rename', {
          projectId: id,
          oldCategory: oldName,
          newCategory: newName,
        });
        setExpandedFolders((prev) => {
          const next = { ...prev };
          if (next[oldKey] !== undefined) {
            next[`${col.id}-${newName}`] = next[oldKey];
            delete next[oldKey];
          }
          return next;
        });
        setSelectedFolder({ colId: col.id, name: newName });
      }

      const overviews = buildFolderOverviewsForSave(
        col,
        oldName,
        newName,
        folderOverviewDraft,
      );
      await api.post('/projects/update', { id, folderOverviews: overviews });

      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== col.id) return c;
          return {
            ...c,
            folderOverviewsRaw: overviews,
            folders: c.folders.map((f) => {
              const name = f.name === oldName ? newName : f.name;
              const row = overviews.find(
                (o) => o.name.trim().toLowerCase() === name.trim().toLowerCase(),
              );
              return {
                ...f,
                name,
                overview: row?.description?.trim() || undefined,
              };
            }),
          };
        }),
      );
      setEditingFolderOverview(false);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not save folder');
    } finally {
      setSavingFolderOverview(false);
    }
  };

  const cancelCollectionOverviewEdit = () => {
    if (selectedCol) {
      setColNameDraft(selectedCol.name);
      setColDescDraft(selectedCol.description ?? '');
    }
    setEditingCollectionOverview(false);
  };

  const cancelFolderOverviewEdit = () => {
    if (selectedFolderView) {
      setFolderOverviewDraft(selectedFolderView.folder.overview ?? '');
      setFolderNameDraft(selectedFolderView.folder.name);
    }
    setEditingFolderOverview(false);
  };

  const cancelEndpointNameEdit = () => {
    if (selectedEp) setEndpointNameDraft(selectedEp.name);
    setEditingEndpointName(false);
  };

  const handleSelectEndpoint = useCallback((id: string) => {
    setSelectedFolder(null);
    setSelectedEpId(id);
    setScenarioIdx(0);
    setReqTab('Params');
    setResTab('Body');
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setMobileSidebarOpen(false);
  }, []);

  const appendRequestHistoryEntry = useCallback(
    (entry: DashboardHistoryEntry) => {
      setRequestHistory((prev) => {
        const next = [entry, ...prev].slice(0, REQUEST_HISTORY_MAX);
        if (!user?.id) {
          saveRequestHistory(userEnvKey, next);
        }
        return next;
      });
      if (user?.id) {
        void pushBackendRequestHistoryEntry(entry).catch(() => {
          /* UI keeps optimistic row */
        });
      }
    },
    [user?.id, userEnvKey],
  );

  const clearRequestHistory = useCallback(() => {
    historySyncGen.current += 1;
    setRequestHistory([]);
    if (user?.id) {
      void clearBackendRequestHistory().catch(() => {});
    } else {
      saveRequestHistory(userEnvKey, []);
    }
  }, [user?.id, userEnvKey]);

  const replayHistoryEntry = useCallback(
    (entry: DashboardHistoryEntry) => {
      setSidebarTab('Collections');
      if (!entry.endpointId) return;
      const loc = findEndpointSidebarLocation(collections, entry.endpointId);
      if (loc) {
        setSelectedColId(loc.colId);
        setExpandedCols((p) => ({ ...p, [loc.colId]: true }));
        setExpandedFolders((p) => ({ ...p, [loc.folderKey]: true }));
      }
      handleSelectEndpoint(entry.endpointId);
      queueMicrotask(() => {
        setPathDrafts((p) => ({ ...p, [entry.endpointId!]: entry.pathDraft }));
        setMethodDrafts((p) => ({ ...p, [entry.endpointId!]: entry.method }));
      });
    },
    [collections, handleSelectEndpoint],
  );

  const submitManualCreate = async () => {
    if (!manualCreateModal || manualCreateBusy) return;
    const name = manualCreateName.trim();
    if (manualCreateModal.kind !== 'request' && !name) {
      window.alert('Name is required.');
      return;
    }
    if (manualCreateModal.kind === 'request') {
      if (!name || !manualCreatePath.trim()) {
        window.alert('Request name and path are required.');
        return;
      }
    }
    setManualCreateBusy(true);
    try {
      if (manualCreateModal.kind === 'collection') {
        const res = (await api.post('/projects/create', {
          name,
          framework: 'Manual',
        })) as { project?: { id: number } };
        await refreshCollections();
        if (res.project?.id) {
          const cid = `col-${res.project.id}`;
          setSelectedColId(cid);
          setSelectedEpId('');
          setSelectedFolder(null);
          setExpandedCols((p) => ({ ...p, [cid]: true }));
        }
      } else if (manualCreateModal.kind === 'folder') {
        const projectId = projectIdFromCollectionId(manualCreateModal.colId);
        if (projectId == null) return;
        await api.post('/projects/folder/create', { projectId, name });
        await refreshCollections();
        const key = `${manualCreateModal.colId}-${name}`;
        setExpandedCols((p) => ({ ...p, [manualCreateModal.colId]: true }));
        setExpandedFolders((p) => ({ ...p, [key]: true }));
        setSelectedColId(manualCreateModal.colId);
        setSelectedEpId('');
        setSelectedFolder({ colId: manualCreateModal.colId, name });
      } else {
        const projectId = projectIdFromCollectionId(manualCreateModal.colId);
        if (projectId == null) return;
        const res = (await api.post('/projects/endpoint/create', {
          projectId,
          method: manualCreateMethod,
          path: manualCreatePath.trim(),
          name,
          category: manualCreateModal.folderName,
        })) as { endpoint?: { id: number } };
        await refreshCollections();
        if (res.endpoint?.id) {
          const epId = `ep-${res.endpoint.id}`;
          const { colId, folderName } = manualCreateModal;
          setExpandedCols((p) => ({ ...p, [colId]: true }));
          setExpandedFolders((p) => ({ ...p, [`${colId}-${folderName}`]: true }));
          setSelectedColId(colId);
          setSelectedFolder(null);
          handleSelectEndpoint(epId);
        }
      }
      setManualCreateModal(null);
      setManualCreateName('');
      setManualCreatePath('/');
      setManualCreateMethod('GET');
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not create');
    } finally {
      setManualCreateBusy(false);
    }
  };

  const saveEndpointName = async () => {
    if (!selectedEp) return;
    const epId = endpointNumericId(selectedEpId);
    if (epId == null) return;
    const name = endpointNameDraft.trim();
    if (!name) {
      window.alert('Request name cannot be empty.');
      return;
    }
    setSavingEndpointName(true);
    try {
      await api.patch(`/projects/endpoint/${epId}`, { name });
      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          folders: c.folders.map((f) => ({
            ...f,
            endpoints: f.endpoints.map((e) => (e.id === selectedEpId ? { ...e, name } : e)),
          })),
        })),
      );
      setEditingEndpointName(false);
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not save request name');
    } finally {
      setSavingEndpointName(false);
    }
  };

  const resetEndpointRequestLineDrafts = useCallback(() => {
    setPathDrafts((prev) => {
      const next = { ...prev };
      delete next[selectedEpId];
      return next;
    });
    setMethodDrafts((prev) => {
      const next = { ...prev };
      delete next[selectedEpId];
      return next;
    });
  }, [selectedEpId]);

  const saveEndpointRequestLine = async () => {
    if (!selectedEp) return;
    const epNum = endpointNumericId(selectedEpId);
    if (epNum == null) return;
    const pathTrim = pathDraft.trim();
    if (!pathTrim) {
      window.alert('Path cannot be empty.');
      return;
    }
    const methodNorm = normalizeMethod(methodDraft);
    setSavingEndpointRequestLine(true);
    try {
      await api.patch(`/projects/endpoint/${epNum}`, {
        path: pathTrim.startsWith('/') ? pathTrim : `/${pathTrim}`,
        method: methodNorm,
      });
      const savedPath = pathTrim.startsWith('/') ? pathTrim : `/${pathTrim}`;
      setCollections((prev) =>
        prev.map((c) => ({
          ...c,
          folders: c.folders.map((f) => ({
            ...f,
            endpoints: f.endpoints.map((e) =>
              e.id === selectedEpId ? { ...e, path: savedPath, method: methodNorm } : e,
            ),
          })),
        })),
      );
      resetEndpointRequestLineDrafts();
    } catch (e: unknown) {
      window.alert(e instanceof Error ? e.message : 'Could not save URL or method');
    } finally {
      setSavingEndpointRequestLine(false);
    }
  };

  const activeScenario = selectedEp?.scenarios[scenarioIdx] ?? null;
  const statusOk = (activeScenario?.status ?? 200) < 400;
  const rawBodyDraft = selectedEp
    ? (bodyRawDrafts[selectedEpId] !== undefined ? bodyRawDrafts[selectedEpId]! : selectedEp.body ?? '')
    : '';
  const pathDraft = selectedEp
    ? (pathDrafts[selectedEpId] !== undefined ? pathDrafts[selectedEpId]! : selectedEp.path)
    : '';
  const methodDraft: Method = selectedEp
    ? (methodDrafts[selectedEpId] !== undefined ? methodDrafts[selectedEpId]! : selectedEp.method)
    : 'GET';
  const sampleBody = selectedEp?.body ?? '';
  const bodyDirty = rawBodyDraft !== sampleBody;
  const pathDirty = Boolean(selectedEp && pathDraft !== selectedEp.path);
  const methodDirty = Boolean(selectedEp && methodDraft !== selectedEp.method);

  const activeWorkspaceEnvironment = useMemo(
    () => workspaceEnvironments.find((e) => e.id === activeWorkspaceEnvironmentId) ?? null,
    [workspaceEnvironments, activeWorkspaceEnvironmentId],
  );

  const activeEnvironmentVariablesRecord = useMemo(
    () =>
      activeWorkspaceEnvironment ? variablesToRecord(activeWorkspaceEnvironment.variables) : {},
    [activeWorkspaceEnvironment],
  );

  const resolvedRequestUrl = useMemo(() => {
    if (!selectedEp) return '';
    return resolveRequestDisplayUrl(pathDraft, activeEnvironmentVariablesRecord);
  }, [selectedEp, pathDraft, activeEnvironmentVariablesRecord]);

  const resolvedBaseUrlFromEnvironment = useMemo(
    () => (activeEnvironmentVariablesRecord['baseUrl'] ?? '').replace(/\/+$/, ''),
    [activeEnvironmentVariablesRecord],
  );

  const setActiveWorkspaceEnvironment = (id: string) => {
    if (!workspaceEnvironments.some((e) => e.id === id)) return;
    setActiveWorkspaceEnvironmentId(id);
  };

  const addWorkspaceEnvironment = () => {
    const newEnvId = newRowId();
    setWorkspaceEnvironments((prev) => {
      const active = prev.find((e) => e.id === activeWorkspaceEnvironmentId);
      const vars = normalizeEnvironmentVariables(
        active?.variables?.length
          ? active.variables.map((v) => ({ id: newRowId(), key: v.key, value: v.value }))
          : [{ id: newRowId(), key: 'baseUrl', value: 'http://localhost:3000' }],
      );
      const env: WorkspaceEnvironment = {
        id: newEnvId,
        name: `Environment ${prev.length + 1}`,
        color: colorForIndex(prev.length),
        variables: vars,
      };
      return [...prev, env];
    });
    setActiveWorkspaceEnvironmentId(newEnvId);
  };

  const removeWorkspaceEnvironment = (envId: string) => {
    if (workspaceEnvironments.length <= 1) {
      window.alert('You need at least one environment.');
      return;
    }
    const next = workspaceEnvironments.filter((e) => e.id !== envId);
    setWorkspaceEnvironments(next);
    if (activeWorkspaceEnvironmentId === envId) {
      setActiveWorkspaceEnvironmentId(next[0]!.id);
    }
  };

  const renameWorkspaceEnvironment = (envId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setWorkspaceEnvironments((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, name: trimmed } : e)),
    );
  };

  const patchActiveWorkspaceVariables = (
    updater: (vars: WorkspaceEnvVariableRow[]) => WorkspaceEnvVariableRow[],
  ) => {
    setWorkspaceEnvironments((prev) =>
      prev.map((e) => {
        if (e.id !== activeWorkspaceEnvironmentId) return e;
        const variables = normalizeEnvironmentVariables(updater(e.variables));
        return { ...e, variables };
      }),
    );
  };

  const addWorkspaceVariable = () => {
    patchActiveWorkspaceVariables((vars) => [...vars, { id: newRowId(), key: '', value: '' }]);
  };

  const removeWorkspaceVariable = (rowId: string) => {
    patchActiveWorkspaceVariables((vars) => {
      const row = vars.find((v) => v.id === rowId);
      if (row && isBaseUrlVariableKey(row.key)) return vars;
      return vars.filter((v) => v.id !== rowId);
    });
  };

  const updateWorkspaceVariable = (
    rowId: string,
    patch: Partial<Pick<WorkspaceEnvVariableRow, 'key' | 'value'>>,
  ) => {
    patchActiveWorkspaceVariables((vars) => {
      const next = vars.map((v) => {
        if (v.id !== rowId) return v;
        if (isBaseUrlVariableKey(v.key)) {
          return patch.value !== undefined ? { ...v, value: patch.value } : v;
        }
        return { ...v, ...patch };
      });
      return normalizeEnvironmentVariables(next);
    });
  };

  useEffect(() => {
    const ep = collections.flatMap((c) => c.folders.flatMap((f) => f.endpoints)).find((e) => e.id === selectedEpId);
    queueMicrotask(() => {
      setReqBodyMode(ep?.body ? 'raw' : 'none');
    });
  }, [selectedEpId]);

  useEffect(() => {
    queueMicrotask(() => setResBodyView('pretty'));
  }, [selectedEpId, scenarioIdx]);

  useEffect(() => {
    if (!selectedEp) return;
    const len = selectedEp.scenarios.length;
    if (len === 0) return;
    setScenarioIdx((i) => (i >= len ? 0 : i));
  }, [selectedEp, selectedEp?.scenarios.length]);

  const cellKey = (kind: 'param-path' | 'param-query' | 'header', id: string) =>
    `${selectedEpId}:${kind}:${id}`;
  const getCell = (kind: 'param-path' | 'param-query' | 'header', id: string, fallback: string) =>
    cellDrafts[cellKey(kind, id)] ?? fallback;
  const setCell = (kind: 'param-path' | 'param-query' | 'header', id: string, value: string) => {
    const k = cellKey(kind, id);
    setCellDrafts((prev) => ({ ...prev, [k]: value }));
  };

  useEffect(() => {
    setLiveHttpResponse(null);
  }, [selectedEpId]);

  useEffect(() => {
    latestSendRef.current = {
      selectedEp,
      selectedEpId,
      pathDraft,
      methodDraft,
      rawBodyDraft,
      reqBodyMode,
      activeEnvironmentVariablesRecord,
      cellDrafts,
      manualPathRowsByEp,
      manualQueryRowsByEp,
      manualHeaderRowsByEp,
      formDataRowsByEp,
      urlEncodedRowsByEp,
      authByEp,
    };
  }, [
    selectedEp,
    selectedEpId,
    pathDraft,
    methodDraft,
    rawBodyDraft,
    reqBodyMode,
    activeEnvironmentVariablesRecord,
    cellDrafts,
    manualPathRowsByEp,
    manualQueryRowsByEp,
    manualHeaderRowsByEp,
    formDataRowsByEp,
    urlEncodedRowsByEp,
    authByEp,
  ]);

  const clearLiveHttpResponse = useCallback(() => setLiveHttpResponse(null), []);

  const saveLiveResponseAsExample = useCallback(
    async (exampleName: string) => {
      const ep = selectedEp;
      const live = liveHttpResponse;
      if (!ep || !live || live.error === 'network') {
        throw new Error('Nothing to save — run Send and wait for a response first.');
      }
      const numericId = endpointNumericId(ep.id);
      if (numericId == null) {
        throw new Error('This request cannot be saved yet.');
      }

      let body: unknown = live.parsedJson;
      if (body === null && live.bodyText.trim()) {
        try {
          body = JSON.parse(live.bodyText) as unknown;
        } catch {
          body = live.bodyText;
        }
      }
      if (body === undefined || body === null) body = {};

      const label = exampleName.trim() || `Example ${live.status}`;
      const newScenario: Scenario = {
        status: live.status,
        description: label,
        body,
      };

      const nextScenarios = [...ep.scenarios, newScenario];

      setSavingLiveExample(true);
      try {
        await api.patch(`/projects/endpoint/${numericId}`, { scenarios: nextScenarios });

        setCollections((cols) =>
          cols.map((c) => ({
            ...c,
            folders: c.folders.map((f) => ({
              ...f,
              endpoints: f.endpoints.map((e) =>
                e.id === ep.id ? { ...e, scenarios: nextScenarios } : e,
              ),
            })),
          })),
        );

        clearLiveHttpResponse();
        setScenarioIdx(nextScenarios.length - 1);
      } finally {
        setSavingLiveExample(false);
      }
    },
    [selectedEp, liveHttpResponse, clearLiveHttpResponse],
  );

  const sendHttpRequest = useCallback(async () => {
    const s = latestSendRef.current;
    if (!s?.selectedEp || sendBusyRef.current) return;
    sendBusyRef.current = true;
    setSendBusy(true);

    const pushHistory = (
      specUrl: string,
      o: {
        status: number;
        statusText: string;
        ms: number;
        ok: boolean;
        error?: 'network';
      },
    ) => {
      appendRequestHistoryEntry({
        id: newRowId(),
        at: Date.now(),
        method: normalizeMethod(s.methodDraft),
        pathDraft: s.pathDraft,
        resolvedUrl: specUrl,
        status: o.status,
        statusText: o.statusText,
        ms: o.ms,
        ok: o.ok,
        error: o.error,
        endpointId: s.selectedEpId,
        endpointName: s.selectedEp?.name ?? null,
      });
    };

    try {
      const epId = s.selectedEpId;
      const getCell = (kind: 'param-path' | 'param-query' | 'header', id: string, fallback: string) =>
        s.cellDrafts[`${epId}:${kind}:${id}`] ?? fallback;

      let spec: ReturnType<typeof buildDashboardFetchRequest>;
      try {
        spec = buildDashboardFetchRequest({
          envVars: s.activeEnvironmentVariablesRecord,
          ep: s.selectedEp,
          methodOverride: s.methodDraft,
          pathDraft: s.pathDraft,
          rawBodyDraft: s.rawBodyDraft,
          reqBodyMode: s.reqBodyMode,
          getCell,
          manualPathRows: s.manualPathRowsByEp[epId] ?? [],
          manualQueryRows: s.manualQueryRowsByEp[epId] ?? [],
          manualHeaderRows: s.manualHeaderRowsByEp[epId] ?? [],
          formDataRows: s.formDataRowsByEp[epId] ?? [],
          urlEncodedRows: s.urlEncodedRowsByEp[epId] ?? [],
          auth: s.authByEp[epId] ?? defaultAuthConfig(),
        });
      } catch (e: unknown) {
        setLiveHttpResponse({
          ok: false,
          status: 0,
          statusText: 'Invalid request',
          ms: 0,
          headers: [],
          bodyText: e instanceof Error ? e.message : String(e),
          parsedJson: null,
          error: 'network',
        });
        return;
      }

      if (!/^https?:\/\//i.test(spec.url)) {
        setLiveHttpResponse({
          ok: false,
          status: 0,
          statusText: 'Missing base URL',
          ms: 0,
          headers: [],
          bodyText:
            'The resolved URL is not absolute. Set baseUrl in your active environment (sidebar → Environment).',
          parsedJson: null,
          error: 'network',
        });
        pushHistory(spec.url, {
          status: 0,
          statusText: 'Missing base URL',
          ms: 0,
          ok: false,
          error: 'network',
        });
        return;
      }

      const t0 = performance.now();
      let res: Response;
      try {
        res = await fetch(spec.url, spec.init);
      } catch (e: unknown) {
        const ms = Math.round(performance.now() - t0);
        setLiveHttpResponse({
          ok: false,
          status: 0,
          statusText: 'Network Error',
          ms,
          headers: [],
          bodyText: e instanceof Error ? e.message : String(e),
          parsedJson: null,
          error: 'network',
        });
        pushHistory(spec.url, {
          status: 0,
          statusText: 'Network Error',
          ms,
          ok: false,
          error: 'network',
        });
        return;
      }

      const ms = Math.round(performance.now() - t0);
      const bodyText = await res.text();
      let parsedJson: unknown | null = null;
      try {
        parsedJson = JSON.parse(bodyText) as unknown;
      } catch {
        parsedJson = null;
      }
      const headers: { key: string; value: string }[] = [];
      res.headers.forEach((value, key) => headers.push({ key, value }));
      setLiveHttpResponse({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText || '',
        ms,
        headers,
        bodyText,
        parsedJson,
      });
      pushHistory(spec.url, {
        status: res.status,
        statusText: res.statusText || '',
        ms,
        ok: res.ok,
      });
    } finally {
      sendBusyRef.current = false;
      setSendBusy(false);
    }
  }, [appendRequestHistoryEntry]);

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openTabs.filter((t) => t !== id);
    setOpenTabs(next);
    if (selectedEpId === id) setSelectedEpId(next[next.length - 1] ?? '');
  };

  const canReorderTree = !searchQuery.trim();

  const filteredCollections = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections
      .map((c) => {
        if (c.name.toLowerCase().includes(q)) {
          return c;
        }
        const folders = c.folders
          .map((f) => {
            if (f.name.toLowerCase().includes(q)) {
              return f;
            }
            const endpoints = f.endpoints.filter(
              (e) =>
                e.name.toLowerCase().includes(q) ||
                e.path.toLowerCase().includes(q),
            );
            return { ...f, endpoints };
          })
          .filter(
            (f) =>
              f.name.toLowerCase().includes(q) || f.endpoints.length > 0,
          );
        return { ...c, folders };
      })
      .filter((c) => c.name.toLowerCase().includes(q) || c.folders.length > 0);
  })();

  return {
    // routing/auth
    router,
    user,
    logout,

    // raw state
    collections,
    setCollections,
    loadError,
    listReady,
    sidebarTab,
    setSidebarTab,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    expandedCols,
    setExpandedCols,
    expandedFolders,
    setExpandedFolders,
    selectedColId,
    setSelectedColId,
    selectedEpId,
    setSelectedEpId,
    reqTab,
    setReqTab,
    resTab,
    setResTab,
    scenarioIdx,
    setScenarioIdx,
    searchQuery,
    setSearchQuery,
    openTabs,
    setOpenTabs,
    reqBodyMode,
    setReqBodyMode,
    resBodyView,
    setResBodyView,
    bodyRawDrafts,
    setBodyRawDrafts,
    pathDrafts,
    setPathDrafts,
    setMethodDrafts,
    cellDrafts,
    setCellDrafts,
    deletingCollectionId,
    deleteConfirmCol,
    setDeleteConfirmCol,
    selectedFolder,
    setSelectedFolder,
    colNameDraft,
    setColNameDraft,
    colDescDraft,
    setColDescDraft,
    folderOverviewDraft,
    setFolderOverviewDraft,
    savingCollectionMeta,
    savingFolderOverview,
    editingCollectionOverview,
    setEditingCollectionOverview,
    editingFolderOverview,
    setEditingFolderOverview,
    folderNameDraft,
    setFolderNameDraft,
    editingEndpointName,
    setEditingEndpointName,
    endpointNameDraft,
    setEndpointNameDraft,
    savingEndpointName,
    savingEndpointRequestLine,
    colDocsPublished,
    setColDocsPublished,
    colDocsBaseUrl,
    setColDocsBaseUrl,
    savingPublishDocs,
    manualCreateModal,
    setManualCreateModal,
    manualCreateName,
    setManualCreateName,
    manualCreatePath,
    setManualCreatePath,
    manualCreateMethod,
    setManualCreateMethod,
    manualCreateBusy,

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

    liveHttpResponse,
    sendBusy,
    savingLiveExample,
    requestHistory,

    workspaceEnvironments,
    activeWorkspaceEnvironmentId,

    // derived
    selectedCol,
    allEndpoints,
    selectedEp,
    selectedFolderView,
    activeScenario,
    statusOk,
    rawBodyDraft,
    pathDraft,
    methodDraft,
    sampleBody,
    bodyDirty,
    pathDirty,
    methodDirty,
    canReorderTree,
    filteredCollections,
    activeWorkspaceEnvironment,
    activeEnvironmentVariablesRecord,
    resolvedRequestUrl,
    resolvedBaseUrlFromEnvironment,

    // handlers
    refreshCollections,
    openDeleteCollectionModal,
    confirmDeleteCollection,
    savePublishDocs,
    saveCollectionOverview,
    saveFolderOverview,
    cancelCollectionOverviewEdit,
    cancelFolderOverviewEdit,
    cancelEndpointNameEdit,
    submitManualCreate,
    saveEndpointName,
    saveEndpointRequestLine,
    resetEndpointRequestLineDrafts,
    handleSelectEndpoint,
    closeTab,
    getCell,
    setCell,
    sendHttpRequest,
    clearLiveHttpResponse,
    saveLiveResponseAsExample,
    replayHistoryEntry,
    clearRequestHistory,
    setActiveWorkspaceEnvironment,
    addWorkspaceEnvironment,
    removeWorkspaceEnvironment,
    renameWorkspaceEnvironment,
    addWorkspaceVariable,
    removeWorkspaceVariable,
    updateWorkspaceVariable,
  };
}
