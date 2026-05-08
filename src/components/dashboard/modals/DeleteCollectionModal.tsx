'use client';

import { useDashboard } from '../DashboardContext';

export function DeleteCollectionModal() {
  const {
    deleteConfirmCol,
    setDeleteConfirmCol,
    deletingCollectionId,
    confirmDeleteCollection,
  } = useDashboard();

  if (!deleteConfirmCol) return null;
  const requestCount = deleteConfirmCol.folders.reduce((a, f) => a + f.endpoints.length, 0);
  const deleting = deletingCollectionId === deleteConfirmCol.id;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-collection-title"
      onClick={() => {
        if (!deleting) setDeleteConfirmCol(null);
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
        style={{ background: '#242424', borderColor: '#3A3A3A' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-collection-title" className="text-lg font-semibold text-white mb-2">
          Delete collection?
        </h2>
        <p
          className="text-[13px] leading-relaxed mb-6"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          <span className="text-white/80 font-medium">{deleteConfirmCol.name}</span>
          {' '}and all{' '}
          <span className="text-white/80">{requestCount}</span>{' '}
          request
          {requestCount === 1 ? '' : 's'} will be removed from Rauts. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setDeleteConfirmCol(null)}
            className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5"
            style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void confirmDeleteCollection()}
            className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-50 hover:bg-red-500/15"
            style={{
              borderColor: 'rgba(248,113,113,0.45)',
              background: 'rgba(248,113,113,0.12)',
              color: 'rgba(252,165,165,0.95)',
            }}
          >
            {deleting ? 'Deleting…' : 'Delete collection'}
          </button>
        </div>
      </div>
    </div>
  );
}
