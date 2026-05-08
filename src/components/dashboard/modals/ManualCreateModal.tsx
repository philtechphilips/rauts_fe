'use client';

import { useDashboard } from '../DashboardContext';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;

export function ManualCreateModal() {
  const {
    manualCreateModal,
    setManualCreateModal,
    manualCreateName,
    setManualCreateName,
    manualCreatePath,
    setManualCreatePath,
    manualCreateMethod,
    setManualCreateMethod,
    manualCreateBusy,
    submitManualCreate,
  } = useDashboard();

  if (!manualCreateModal) return null;

  const reset = () => {
    setManualCreateModal(null);
    setManualCreateName('');
    setManualCreatePath('/');
    setManualCreateMethod('GET');
  };

  const title =
    manualCreateModal.kind === 'collection'
      ? 'New collection'
      : manualCreateModal.kind === 'folder'
        ? 'New folder'
        : 'New request';

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-create-title"
      onClick={() => {
        if (!manualCreateBusy) reset();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
        style={{ background: '#242424', borderColor: '#3A3A3A' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="manual-create-title" className="text-lg font-semibold text-white mb-4">
          {title}
        </h2>
        {(manualCreateModal.kind === 'collection' || manualCreateModal.kind === 'folder') && (
          <label className="block">
            <span
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Name
            </span>
            <input
              value={manualCreateName}
              onChange={(e) => setManualCreateName(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
              placeholder={manualCreateModal.kind === 'folder' ? 'Folder name' : 'Collection name'}
              autoFocus
            />
          </label>
        )}
        {manualCreateModal.kind === 'request' && (
          <div className="space-y-3">
            <label className="block">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Method
              </span>
              <select
                value={manualCreateMethod}
                onChange={(e) => setManualCreateMethod(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Path
              </span>
              <input
                value={manualCreatePath}
                onChange={(e) => setManualCreatePath(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-lg border text-[13px] outline-none font-mono"
                style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
                placeholder="/api/users"
              />
            </label>
            <label className="block">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Name
              </span>
              <input
                value={manualCreateName}
                onChange={(e) => setManualCreateName(e.target.value)}
                className="mt-1.5 w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.85)' }}
                placeholder="List users"
                autoFocus
              />
            </label>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Folder{' '}
              <span className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {manualCreateModal.folderName}
              </span>
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            disabled={manualCreateBusy}
            onClick={reset}
            className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5"
            style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={manualCreateBusy}
            onClick={() => void submitManualCreate()}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors disabled:opacity-50 hover:bg-[#d4e820]"
            style={{ borderColor: 'rgba(207,254,38,0.35)', background: '#CFFE26', color: '#111' }}
          >
            {manualCreateBusy ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
