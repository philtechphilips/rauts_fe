'use client';

import { useDashboard } from '../DashboardContext';
import { IconEdit, IconFolder } from '../icons';
import { MethodBadge } from '../MethodBadge';
import { projectIdFromCollectionId } from '@/lib/dashboard/ids';

export function FolderOverview() {
  const {
    selectedFolderView,
    editingFolderOverview,
    setEditingFolderOverview,
    folderNameDraft,
    setFolderNameDraft,
    folderOverviewDraft,
    setFolderOverviewDraft,
    savingFolderOverview,
    cancelFolderOverviewEdit,
    saveFolderOverview,
    handleSelectEndpoint,
    setSelectedColId,
  } = useDashboard();

  if (!selectedFolderView) return null;
  const editable = projectIdFromCollectionId(selectedFolderView.col.id) != null;

  return (
    <div
      className={`max-w-2xl mx-auto p-10 space-y-8${editingFolderOverview ? ' select-text' : ''}`}
    >
      <div>
        <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>{selectedFolderView.col.name}</span>
          <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{selectedFolderView.folder.name}</span>
        </p>
        <div className="flex items-center gap-2 mb-3">
          <span className="shrink-0" style={{ color: '#FCA130' }}>
            <IconFolder open />
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: '#FCA130' }}
          >
            Folder
          </span>
        </div>
        {editable && editingFolderOverview ? (
          <input
            value={folderNameDraft}
            onChange={(e) => setFolderNameDraft(e.target.value)}
            className="w-full text-2xl font-semibold rounded-lg border px-3 py-2 outline-none focus:border-[#FCA130]/40 mb-4"
            style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: '#fff' }}
          />
        ) : (
          <h1 className="text-2xl font-semibold text-white mb-4">{selectedFolderView.folder.name}</h1>
        )}
        <div className="flex items-center justify-between gap-2 mb-2">
          <label
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Folder overview
          </label>
          {editable && !editingFolderOverview && (
            <button
              type="button"
              title="Edit folder name and overview"
              onClick={() => setEditingFolderOverview(true)}
              className="p-2 rounded-lg border transition-colors hover:bg-white/5 select-none"
              style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
            >
              <IconEdit />
            </button>
          )}
        </div>
        {editable ? (
          editingFolderOverview ? (
            <>
              <textarea
                value={folderOverviewDraft}
                onChange={(e) => setFolderOverviewDraft(e.target.value)}
                rows={8}
                placeholder="Describe this folder’s endpoints and purpose…"
                className="w-full rounded-lg border px-3 py-2.5 text-[14px] leading-relaxed outline-none focus:border-[#FCA130]/40 resize-y min-h-[140px]"
                style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.88)' }}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={savingFolderOverview}
                  onClick={cancelFolderOverviewEdit}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5 select-none"
                  style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingFolderOverview}
                  onClick={() => void saveFolderOverview()}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5 select-none"
                  style={{ borderColor: '#4A4A4A', color: '#FCA130' }}
                >
                  {savingFolderOverview ? 'Saving…' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <div
              className="p-5 rounded-lg border select-text"
              style={{ background: '#242424', borderColor: '#3A3A3A' }}
            >
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {selectedFolderView.folder.overview?.trim()
                  ? selectedFolderView.folder.overview
                  : 'No overview yet. Run rauts scan (with AI) to generate folder summaries, or click the pencil to write your own.'}
              </p>
            </div>
          )
        ) : (
          <p
            className="text-[14px] leading-relaxed select-text"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {selectedFolderView.folder.overview?.trim()
              ? selectedFolderView.folder.overview
              : 'No overview yet. Run rauts scan (with AI) to generate folder summaries.'}
          </p>
        )}
      </div>
      <div>
        <h3 className="text-[12px] font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Requests
        </h3>
        <div className="space-y-1">
          {selectedFolderView.folder.endpoints.map((ep) => (
            <button
              key={ep.id}
              type="button"
              onClick={() => {
                handleSelectEndpoint(ep.id);
                setSelectedColId(selectedFolderView.col.id);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-left transition-colors hover:bg-white/4"
              style={{ background: '#242424', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.75)' }}
            >
              <MethodBadge method={ep.method} />
              <span className="text-[13px] flex-1 truncate">{ep.name}</span>
              <span
                className="text-[11px] font-mono truncate max-w-[45%]"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {ep.path}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
