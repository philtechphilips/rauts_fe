'use client';

import { useDashboard } from '../DashboardContext';
import {
  IconChevron,
  IconClose,
  IconDragGrip,
  IconEdit,
  IconFolder,
  IconLayers,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
} from '../icons';
import { MethodBadge } from '../MethodBadge';
import { projectIdFromCollectionId, endpointNumericId } from '@/lib/dashboard/ids';
import {
  DND_MIME,
  parseDndPayload,
  reorderByInsertBefore,
} from '@/lib/dashboard/dnd';
import { api } from '@/lib/api';
import { loadUserDashboardCollections } from '@/lib/dashboard-collections';

export function CollectionsPanel() {
  const ctx = useDashboard();
  const {
    listReady,
    filteredCollections,
    collections,
    setCollections,
    expandedCols,
    setExpandedCols,
    expandedFolders,
    setExpandedFolders,
    selectedColId,
    setSelectedColId,
    selectedEpId,
    setSelectedEpId,
    selectedFolder,
    setSelectedFolder,
    canReorderTree,
    searchQuery,
    setSearchQuery,
    setManualCreateModal,
    setManualCreateName,
    setManualCreatePath,
    setManualCreateMethod,
    deletingCollectionId,
    openDeleteCollectionModal,
    setEditingCollectionOverview,
    setEditingFolderOverview,
    setEndpointNameDraft,
    setEditingEndpointName,
    handleSelectEndpoint,
  } = ctx;

  const resetManualCreateInputs = () => {
    setManualCreateName('');
    setManualCreatePath('/');
    setManualCreateMethod('GET');
  };

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0 border-b"
        style={{ borderColor: '#3A3A3A' }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Collections
        </span>
        <div className="flex items-center gap-1">
          <button
            title="Import"
            className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <IconUpload />
          </button>
          <button
            type="button"
            title="New collection"
            onClick={() => {
              setManualCreateModal({ kind: 'collection' });
              resetManualCreateInputs();
            }}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <IconPlus />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 shrink-0 border-b" style={{ borderColor: '#3A3A3A' }}>
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded"
          style={{ background: '#1A1A1A', border: '1px solid #3A3A3A' }}
        >
          <IconSearch />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections, folders, requests…"
            aria-label="Search collections, folders, and requests"
            className="flex-1 min-w-0 bg-transparent text-[12px] outline-none placeholder:text-[rgba(255,255,255,0.22)]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'rgba(255,255,255,0.25)' }}>
              <IconClose />
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {listReady && collections.length === 0 && (
          <div className="mx-2 mb-2 rounded-lg border px-3 py-4" style={{ borderColor: '#3A3A3A', background: 'rgba(255,255,255,0.02)' }}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Getting started
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
              No collections yet. Tap{' '}
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                +
              </span>{' '}
              or <strong style={{ color: 'rgba(255,255,255,0.5)' }}>New collection</strong> in the header, or run{' '}
              <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.48)' }}>
                rauts scan
              </span>{' '}
              in your repo (after{' '}
              <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.48)' }}>
                rauts login
              </span>
              ).
            </p>
          </div>
        )}
        {listReady &&
          collections.length > 0 &&
          filteredCollections.length === 0 &&
          searchQuery.trim() && (
            <div className="mx-2 mb-2 rounded-lg border px-3 py-4 text-center" style={{ borderColor: '#3A3A3A', background: 'rgba(252,161,48,0.06)' }}>
              <p className="text-[12px] font-medium" style={{ color: 'rgba(252,161,48,0.95)' }}>
                No matches
              </p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Nothing matches &quot;{searchQuery.trim()}&quot;. Try a collection name, folder name, or request path.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-[11px] font-semibold underline"
                style={{ color: '#CFFE26' }}
              >
                Clear search
              </button>
            </div>
          )}
        {filteredCollections.map((col) => {
          const colOpen = expandedCols[col.id];
          const collectionActive = selectedColId === col.id;
          return (
            <div key={col.id}>
              {/* Collection row */}
              <div
                onClick={() => {
                  setExpandedCols((p) => ({ ...p, [col.id]: !p[col.id] }));
                  setSelectedColId(col.id);
                  setSelectedEpId('');
                  setSelectedFolder(null);
                }}
                onDragOver={(e) => {
                  if (!canReorderTree) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={async (e) => {
                  if (!canReorderTree) return;
                  e.preventDefault();
                  const p = parseDndPayload(e);
                  if (!p || p.kind !== 'collection') return;
                  if (p.id === col.id) return;
                  const ids = collections.map((c) => c.id);
                  const fromIdx = ids.indexOf(p.id);
                  const toIdx = ids.indexOf(col.id);
                  if (fromIdx < 0 || toIdx < 0) return;
                  const nextList = reorderByInsertBefore(collections, fromIdx, toIdx);
                  const orderedProjectIds = nextList
                    .map((c) => projectIdFromCollectionId(c.id))
                    .filter((n): n is string => n != null);
                  if (orderedProjectIds.length !== nextList.length) return;
                  const prev = collections;
                  setCollections(nextList);
                  try {
                    await api.post('/projects/reorder/collections', {
                      orderedProjectIds,
                    });
                  } catch (err) {
                    console.error(err);
                    try {
                      const list = await loadUserDashboardCollections();
                      setCollections(list);
                    } catch {
                      setCollections(prev);
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 mx-0.5 rounded-md cursor-pointer group/col transition-colors"
                style={{
                  color: collectionActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: collectionActive ? 'rgba(207,254,38,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = collectionActive
                    ? 'rgba(207,254,38,0.12)'
                    : 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = collectionActive
                    ? 'rgba(207,254,38,0.08)'
                    : 'transparent';
                }}
              >
                {canReorderTree && projectIdFromCollectionId(col.id) != null && (
                  <span
                    title="Drag to reorder"
                    draggable
                    onClick={(ev) => ev.stopPropagation()}
                    onDragStart={(ev) => {
                      ev.stopPropagation();
                      ev.dataTransfer.setData(
                        DND_MIME,
                        JSON.stringify({ kind: 'collection', id: col.id }),
                      );
                      ev.dataTransfer.effectAllowed = 'move';
                    }}
                    className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                  >
                    <IconDragGrip />
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <IconChevron open={!!colOpen} />
                </span>
                <span className="shrink-0" style={{ color: '#CFFE26' }}>
                  <IconLayers size={13} />
                </span>
                <span className="flex-1 text-[12px] font-medium truncate">{col.name}</span>
                {collectionActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: '#CFFE26' }}
                    title="Active collection"
                    aria-hidden
                  />
                )}
                <div className="flex items-center gap-0.5 shrink-0">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/col:opacity-100"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {col.folders.reduce((a, f) => a + f.endpoints.length, 0)}
                  </span>
                  {projectIdFromCollectionId(col.id) != null && (
                    <>
                      <button
                        type="button"
                        title="Edit collection name"
                        draggable={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColId(col.id);
                          setSelectedEpId('');
                          setSelectedFolder(null);
                          setEditingCollectionOverview(true);
                        }}
                        className="p-1 rounded opacity-0 group-hover/col:opacity-100 hover:bg-white/10"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        title="Delete collection"
                        draggable={false}
                        disabled={deletingCollectionId === col.id}
                        onClick={(e) => openDeleteCollectionModal(col, e)}
                        className="p-1 rounded opacity-0 group-hover/col:opacity-100 hover:bg-red-500/15 disabled:opacity-40"
                        style={{ color: 'rgba(248,113,113,0.85)' }}
                      >
                        <IconTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Folders */}
              {colOpen && (
                <div className="pl-3">
                  {projectIdFromCollectionId(col.id) != null && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualCreateModal({ kind: 'folder', colId: col.id });
                        resetManualCreateInputs();
                      }}
                      className="flex items-center gap-1.5 w-[calc(100%-4px)] mx-0.5 mb-0.5 px-2 py-1 rounded text-[11px] transition-colors hover:bg-white/6"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      <IconPlus size={11} />
                      Add folder
                    </button>
                  )}
                  {col.folders.map((folder) => {
                    const key = `${col.id}-${folder.name}`;
                    const folderOpen = expandedFolders[key];
                    const folderActive =
                      !selectedEpId &&
                      selectedFolder?.colId === col.id &&
                      selectedFolder?.name === folder.name;
                    return (
                      <div key={folder.name}>
                        <div
                          className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer group/folder transition-colors"
                          onClick={() => {
                            setExpandedFolders((p) => ({ ...p, [key]: !p[key] }));
                            setSelectedColId(col.id);
                            setSelectedEpId('');
                            setSelectedFolder({ colId: col.id, name: folder.name });
                          }}
                          onDragOver={(e) => {
                            if (!canReorderTree) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={async (e) => {
                            if (!canReorderTree) return;
                            e.preventDefault();
                            e.stopPropagation();
                            const p = parseDndPayload(e);
                            if (!p || p.kind !== 'folder') return;
                            if (p.colId !== col.id || p.folderName === folder.name) return;
                            const pid = projectIdFromCollectionId(col.id);
                            if (pid == null) return;
                            const folderNames = col.folders.map((f) => f.name);
                            const fromIdx = folderNames.indexOf(p.folderName);
                            const toIdx = folderNames.indexOf(folder.name);
                            if (fromIdx < 0 || toIdx < 0) return;
                            const nextFolders = reorderByInsertBefore(
                              col.folders,
                              fromIdx,
                              toIdx,
                            );
                            const prev = collections;
                            setCollections((prevList) =>
                              prevList.map((c) =>
                                c.id === col.id ? { ...c, folders: nextFolders } : c,
                              ),
                            );
                            try {
                              await api.post('/projects/reorder/folders', {
                                projectId: pid,
                                orderedFolderNames: nextFolders.map((f) => f.name),
                              });
                            } catch (err) {
                              console.error(err);
                              try {
                                const list = await loadUserDashboardCollections();
                                setCollections(list);
                              } catch {
                                setCollections(prev);
                              }
                            }
                          }}
                          style={{
                            color: folderOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                            background: folderActive ? 'rgba(252,161,48,0.08)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = folderActive
                              ? 'rgba(252,161,48,0.12)'
                              : 'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = folderActive
                              ? 'rgba(252,161,48,0.08)'
                              : 'transparent';
                          }}
                        >
                          {canReorderTree && projectIdFromCollectionId(col.id) != null && (
                            <span
                              title="Drag to reorder"
                              draggable
                              onClick={(ev) => ev.stopPropagation()}
                              onDragStart={(ev) => {
                                ev.stopPropagation();
                                ev.dataTransfer.setData(
                                  DND_MIME,
                                  JSON.stringify({
                                    kind: 'folder',
                                    colId: col.id,
                                    folderName: folder.name,
                                  }),
                                );
                                ev.dataTransfer.effectAllowed = 'move';
                              }}
                              className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-white/10"
                              style={{ color: 'rgba(255,255,255,0.22)' }}
                            >
                              <IconDragGrip />
                            </span>
                          )}
                          <span style={{ color: 'rgba(255,255,255,0.18)' }}>
                            <IconChevron open={!!folderOpen} />
                          </span>
                          <IconFolder open={!!folderOpen} />
                          <span className="flex-1 text-[12px] truncate">{folder.name}</span>
                          <span
                            className="text-[10px] opacity-0 group-hover/folder:opacity-100"
                            style={{ color: 'rgba(255,255,255,0.25)' }}
                          >
                            {folder.endpoints.length}
                          </span>
                          {projectIdFromCollectionId(col.id) != null && (
                            <>
                              <button
                                type="button"
                                title="Add request"
                                draggable={false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setManualCreateModal({
                                    kind: 'request',
                                    colId: col.id,
                                    folderName: folder.name,
                                  });
                                  resetManualCreateInputs();
                                }}
                                className="p-1 rounded opacity-0 group-hover/folder:opacity-100 hover:bg-white/10 shrink-0"
                                style={{ color: 'rgba(255,255,255,0.35)' }}
                              >
                                <IconPlus />
                              </button>
                              <button
                                type="button"
                                title="Edit folder name"
                                draggable={false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedFolders((p) => ({ ...p, [key]: true }));
                                  setSelectedColId(col.id);
                                  setSelectedEpId('');
                                  setSelectedFolder({ colId: col.id, name: folder.name });
                                  setEditingFolderOverview(true);
                                }}
                                className="p-1 rounded opacity-0 group-hover/folder:opacity-100 hover:bg-white/10 shrink-0"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                              >
                                <IconEdit />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Endpoints */}
                        {folderOpen && (
                          <div className="pl-4">
                            {folder.endpoints.map((ep) => {
                              const sel = selectedEpId === ep.id;
                              return (
                                <div
                                  key={ep.id}
                                  className="group/ep flex items-center gap-1 px-2 py-1.25 rounded transition-colors"
                                  style={{
                                    background: sel ? 'rgba(207,254,38,0.08)' : 'transparent',
                                    color: sel ? '#fff' : 'rgba(255,255,255,0.5)',
                                  }}
                                  onDragOver={(e) => {
                                    if (!canReorderTree) return;
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                  }}
                                  onDrop={async (e) => {
                                    if (!canReorderTree) return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const p = parseDndPayload(e);
                                    if (!p || p.kind !== 'endpoint') return;
                                    if (
                                      p.colId !== col.id ||
                                      p.folderName !== folder.name ||
                                      p.epId === ep.id
                                    ) {
                                      return;
                                    }
                                    const pid = projectIdFromCollectionId(col.id);
                                    if (pid == null) return;
                                    const folderObj = col.folders.find(
                                      (f) => f.name === folder.name,
                                    );
                                    if (!folderObj) return;
                                    const epIds = folderObj.endpoints.map((x) => x.id);
                                    const fromIdx = epIds.indexOf(p.epId);
                                    const toIdx = epIds.indexOf(ep.id);
                                    if (fromIdx < 0 || toIdx < 0) return;
                                    const nextEps = reorderByInsertBefore(
                                      folderObj.endpoints,
                                      fromIdx,
                                      toIdx,
                                    );
                                    const orderedEndpointIds = nextEps
                                      .map((x) => endpointNumericId(x.id))
                                      .filter((n): n is string => n != null);
                                    if (orderedEndpointIds.length !== nextEps.length) return;
                                    const prev = collections;
                                    setCollections((prevList) =>
                                      prevList.map((c) => {
                                        if (c.id !== col.id) return c;
                                        return {
                                          ...c,
                                          folders: c.folders.map((f) =>
                                            f.name === folder.name
                                              ? { ...f, endpoints: nextEps }
                                              : f,
                                          ),
                                        };
                                      }),
                                    );
                                    try {
                                      await api.post('/projects/reorder/endpoints', {
                                        projectId: pid,
                                        category: folder.name,
                                        orderedEndpointIds,
                                      });
                                    } catch (err) {
                                      console.error(err);
                                      try {
                                        const list = await loadUserDashboardCollections();
                                        setCollections(list);
                                      } catch {
                                        setCollections(prev);
                                      }
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!sel)
                                      (e.currentTarget as HTMLElement).style.background =
                                        'rgba(255,255,255,0.04)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                  }}
                                >
                                  {canReorderTree && projectIdFromCollectionId(col.id) != null && (
                                    <span
                                      title="Drag to reorder"
                                      draggable
                                      onClick={(ev) => ev.stopPropagation()}
                                      onDragStart={(ev) => {
                                        ev.stopPropagation();
                                        ev.dataTransfer.setData(
                                          DND_MIME,
                                          JSON.stringify({
                                            kind: 'endpoint',
                                            colId: col.id,
                                            folderName: folder.name,
                                            epId: ep.id,
                                          }),
                                        );
                                        ev.dataTransfer.effectAllowed = 'move';
                                      }}
                                      className="cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded hover:bg-white/10"
                                      style={{ color: 'rgba(255,255,255,0.22)' }}
                                    >
                                      <IconDragGrip />
                                    </span>
                                  )}
                                  <div
                                    role="presentation"
                                    onClick={() => {
                                      handleSelectEndpoint(ep.id);
                                      setSelectedColId(col.id);
                                    }}
                                    className="flex flex-1 min-w-0 items-center gap-2 cursor-pointer py-0.5"
                                  >
                                    <MethodBadge method={ep.method} />
                                    <span className="flex-1 text-[12px] truncate">{ep.name}</span>
                                    {sel && (
                                      <div
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ background: '#CFFE26' }}
                                      />
                                    )}
                                  </div>
                                  {projectIdFromCollectionId(col.id) != null && (
                                    <button
                                      type="button"
                                      title="Edit request name"
                                      draggable={false}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectEndpoint(ep.id);
                                        setSelectedColId(col.id);
                                        setEndpointNameDraft(ep.name);
                                        setEditingEndpointName(true);
                                      }}
                                      className="p-1 rounded opacity-0 group-hover/ep:opacity-100 hover:bg-white/10 shrink-0"
                                      style={{ color: 'rgba(255,255,255,0.35)' }}
                                    >
                                      <IconEdit />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
