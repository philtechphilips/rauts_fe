'use client';

import { useDashboard } from '../DashboardContext';
import { IconEdit, IconFolder, IconLayers, IconTrash } from '../icons';
import { projectIdFromCollectionId } from '@/lib/dashboard/ids';

export function CollectionOverview() {
  const {
    selectedCol,
    deletingCollectionId,
    openDeleteCollectionModal,
    editingCollectionOverview,
    setEditingCollectionOverview,
    colNameDraft,
    setColNameDraft,
    colDescDraft,
    setColDescDraft,
    savingCollectionMeta,
    cancelCollectionOverviewEdit,
    saveCollectionOverview,
    colDocsPublished,
    setColDocsPublished,
    colDocsBaseUrl,
    setColDocsBaseUrl,
    savingPublishDocs,
    savePublishDocs,
    setSelectedColId,
    setSelectedEpId,
    setSelectedFolder,
    setEditingFolderOverview,
  } = useDashboard();

  if (!selectedCol) return null;
  const editable = projectIdFromCollectionId(selectedCol.id) != null;
  const projectId = projectIdFromCollectionId(selectedCol.id);

  return (
    <div
      className={`max-w-2xl mx-auto p-10 space-y-8${editingCollectionOverview ? ' select-text' : ''}`}
    >
      {editingCollectionOverview && editable ? (
        /* Unified, Premium Metadata Edit Panel */
        <div
          className="p-6 rounded-xl border space-y-6 transition-all duration-300"
          style={{
            background: '#242424',
            borderColor: 'rgba(207,254,38,0.25)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(207,254,38,0.02)',
          }}
        >
          <div className="flex items-center gap-2 pb-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#CFFE26' }}>
              <IconLayers size={16} />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CFFE26' }}>
              Edit Collection Metadata
            </p>
          </div>

          {/* Edit Name */}
          <div className="space-y-2">
            <label
              className="text-[10px] font-bold uppercase tracking-[0.15em] block"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Collection Name
            </label>
            <input
              value={colNameDraft}
              onChange={(e) => setColNameDraft(e.target.value)}
              placeholder="e.g. Payments API Service"
              className="w-full text-[14px] font-semibold rounded-lg border px-3.5 py-2.5 outline-none transition-all duration-200 focus:border-[#CFFE26]/50 focus:ring-2 focus:ring-[#CFFE26]/10"
              style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: '#fff' }}
            />
          </div>

          {/* Edit Overview */}
          <div className="space-y-2">
            <label
              className="text-[10px] font-bold uppercase tracking-[0.15em] block"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Collection Overview / Description
            </label>
            <textarea
              value={colDescDraft}
              onChange={(e) => setColDescDraft(e.target.value)}
              rows={6}
              placeholder="Describe this API collection or service..."
              className="w-full rounded-lg border px-3.5 py-3 text-[13.5px] leading-relaxed outline-none transition-all duration-200 resize-y min-h-[140px] focus:border-[#CFFE26]/50 focus:ring-2 focus:ring-[#CFFE26]/10"
              style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-4.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              disabled={savingCollectionMeta}
              onClick={cancelCollectionOverviewEdit}
              className="px-4 py-2 rounded-lg text-[12px] font-bold border transition-all duration-150 hover:bg-white/5 active:scale-95 select-none cursor-pointer"
              style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.6)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingCollectionMeta}
              onClick={() => void saveCollectionOverview()}
              className="px-5 py-2 rounded-lg text-[12px] font-bold transition-all duration-150 active:scale-95 select-none cursor-pointer flex items-center justify-center min-w-[100px]"
              style={{ background: '#CFFE26', color: '#111', boxShadow: '0 4px 12px rgba(207,254,38,0.2)' }}
            >
              {savingCollectionMeta ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : (
        /* Read Mode Layout */
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="shrink-0" style={{ color: '#CFFE26' }}>
              <IconLayers size={18} />
            </span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: '#CFFE26' }}
            >
              Collection
            </span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-semibold text-white">{selectedCol.name}</h1>

            {editable && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  title="Edit collection details"
                  onClick={() => setEditingCollectionOverview(true)}
                  className="p-2 rounded-lg border transition-all duration-150 hover:bg-white/5 hover:border-[#CFFE26]/40 select-none cursor-pointer"
                  style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
                >
                  <IconEdit />
                </button>
                <button
                  type="button"
                  disabled={deletingCollectionId === selectedCol.id}
                  onClick={() => openDeleteCollectionModal(selectedCol)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-red-500/10 select-none cursor-pointer"
                  style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.9)' }}
                >
                  <IconTrash />
                  Delete collection
                </button>
              </div>
            )}
          </div>

          <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {selectedCol.folders.reduce((a, f) => a + f.endpoints.length, 0)} requests ·{' '}
            {selectedCol.folders.length} folders
          </p>

          <label
            className="text-[11px] font-semibold uppercase tracking-wider block mb-2"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Collection overview
          </label>

          <div
            className="p-5 rounded-lg border select-text transition-all"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
          >
            <p className="text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {selectedCol.description?.trim()
                ? selectedCol.description
                : editable
                ? 'No overview yet. Click the pencil to add a description, or run rauts scan with AI.'
                : 'No description provided.'}
            </p>
          </div>
        </div>
      )}

      {editable && (
        <div
          className="p-5 rounded-lg border space-y-4 select-none"
          style={{ background: '#242424', borderColor: '#3A3A3A' }}
        >
          <label
            className="text-[11px] font-semibold uppercase tracking-wider block"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Published documentation
          </label>
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.32)' }}>
            When published, anyone can read this collection at{' '}
            <code className="text-[11px]" style={{ color: 'rgba(207,254,38,0.75)' }}>
              /docs/{projectId}
            </code>{' '}
            (no login).
          </p>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={colDocsPublished}
              onChange={(e) => setColDocsPublished(e.target.checked)}
              className="rounded"
              style={{ accentColor: '#CFFE26' }}
            />
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Publish documentation
            </span>
          </label>
          <div>
            <label
              className="text-[11px] font-medium block mb-1.5"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Docs base URL
            </label>
            <input
              type="url"
              value={colDocsBaseUrl}
              onChange={(e) => setColDocsBaseUrl(e.target.value)}
              placeholder="https://api.myproduct.com"
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#CFFE26]/35"
              style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={savingPublishDocs}
              onClick={() => void savePublishDocs()}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-40 hover:bg-[#d4e820]"
              style={{ borderColor: 'rgba(207,254,38,0.35)', background: '#CFFE26', color: '#111' }}
            >
              {savingPublishDocs ? 'Saving…' : 'Save publish settings'}
            </button>
            {colDocsPublished && (
              <a
                href={`/docs/${projectId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors hover:bg-white/6"
                style={{ borderColor: '#3A3A3A', color: '#CFFE26' }}
              >
                View published docs
              </a>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Requests', value: selectedCol.folders.reduce((a, f) => a + f.endpoints.length, 0) },
          { label: 'Folders', value: selectedCol.folders.length },
          { label: 'Framework', value: selectedCol.framework ?? '—' },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-lg border"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
          >
            <div className="text-xl font-semibold text-white mb-1">{s.value}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-[12px] font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Folders
        </h3>
        <div className="space-y-2">
          {selectedCol.folders.map((f) => (
            <div
              key={f.name}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedColId(selectedCol.id);
                setSelectedEpId('');
                setSelectedFolder({ colId: selectedCol.id, name: f.name });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedColId(selectedCol.id);
                  setSelectedEpId('');
                  setSelectedFolder({ colId: selectedCol.id, name: f.name });
                }
              }}
              className="w-full text-left rounded-lg border transition-colors hover:bg-white/3 cursor-pointer"
              style={{ background: '#242424', borderColor: '#3A3A3A' }}
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <IconFolder open />
                  <div className="min-w-0">
                    <span
                      className="text-[13px] block"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      {f.name}
                    </span>
                    {f.overview ? (
                      <p
                        className="text-[12px] leading-relaxed mt-1.5"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                      >
                        {f.overview}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {f.endpoints.length} request{f.endpoints.length !== 1 ? 's' : ''}
                  </span>
                  {editable && (
                    <button
                      type="button"
                      title="Edit folder name"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColId(selectedCol.id);
                        setSelectedEpId('');
                        setSelectedFolder({ colId: selectedCol.id, name: f.name });
                        setEditingFolderOverview(true);
                      }}
                      className="p-1.5 rounded hover:bg-white/10"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      <IconEdit />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
