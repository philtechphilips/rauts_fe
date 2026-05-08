'use client';

import { useDashboard } from '../DashboardContext';
import { IconLayers } from '../icons';

export function EmptyOverview() {
  const {
    listReady,
    collections,
    setManualCreateModal,
    setManualCreateName,
    setManualCreatePath,
    setManualCreateMethod,
  } = useDashboard();

  if (!listReady) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12">
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Loading collections…
        </p>
      </div>
    );
  }

  const openNewCollection = () => {
    setManualCreateModal({ kind: 'collection' });
    setManualCreateName('');
    setManualCreatePath('/');
    setManualCreateMethod('GET');
  };

  if (collections.length === 0) {
    return (
      <div className="flex min-h-[min(520px,70vh)] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mx-auto mb-5 flex justify-center" style={{ color: 'rgba(255,255,255,0.14)' }}>
          <IconLayers size={52} />
        </div>
        <h2 className="mb-2 text-[16px] font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
          No collections yet
        </h2>
        <p className="mb-6 max-w-md text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Start with an empty collection here, import from GitHub in the sidebar (connect OAuth, then queue a branch
          scan—we will email you when it finishes), or sync from your machine with{' '}
          <span className="font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            rauts scan
          </span>{' '}
          after{' '}
          <span className="font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            rauts login
          </span>
          .
        </p>
        <button
          type="button"
          onClick={openNewCollection}
          className="rounded-lg px-5 py-2.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#d4e820]"
          style={{ background: '#CFFE26' }}
        >
          New collection
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[min(420px,60vh)] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex justify-center" style={{ color: 'rgba(255,255,255,0.12)' }}>
        <IconLayers size={44} />
      </div>
      <p className="mb-2 max-w-sm text-[14px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
        Select a collection in the sidebar to view its overview and endpoints.
      </p>
      <p className="max-w-sm text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.26)' }}>
        Tip: use <strong style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Search</strong> above the
        tree to filter by collection name, folder, or request path.
      </p>
      <button
        type="button"
        onClick={openNewCollection}
        className="mt-8 text-[12px] font-medium underline-offset-2 transition-colors hover:text-[#d4e820]"
        style={{ color: '#CFFE26' }}
      >
        Or create another collection
      </button>
    </div>
  );
}
