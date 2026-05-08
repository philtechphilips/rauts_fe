'use client';

import { useDashboard } from '../DashboardContext';
import { IconEdit } from '../icons';
import { endpointNumericId } from '@/lib/dashboard/ids';

export function RequestNameBar() {
  const {
    selectedEp,
    selectedEpId,
    editingEndpointName,
    setEditingEndpointName,
    endpointNameDraft,
    setEndpointNameDraft,
    savingEndpointName,
    cancelEndpointNameEdit,
    saveEndpointName,
  } = useDashboard();

  if (!selectedEp) return null;
  const editable = endpointNumericId(selectedEpId) != null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 shrink-0 border-b select-text"
      style={{ background: '#222', borderColor: '#3A3A3A' }}
    >
      {editingEndpointName && editable ? (
        <>
          <input
            value={endpointNameDraft}
            onChange={(e) => setEndpointNameDraft(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-[14px] font-medium outline-none focus:border-[#CFFE26]/40"
            style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.9)' }}
            aria-label="Request name"
          />
          <button
            type="button"
            disabled={savingEndpointName}
            onClick={cancelEndpointNameEdit}
            className="px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5 select-none shrink-0"
            style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={savingEndpointName}
            onClick={() => void saveEndpointName()}
            className="px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors disabled:opacity-40 hover:bg-white/5 select-none shrink-0"
            style={{ borderColor: '#4A4A4A', color: '#CFFE26' }}
          >
            {savingEndpointName ? 'Saving…' : 'Save'}
          </button>
        </>
      ) : (
        <>
          <span
            className="text-[13px] font-medium truncate flex-1 min-w-0"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {selectedEp.name}
          </span>
          {editable && (
            <button
              type="button"
              title="Edit request name"
              onClick={() => {
                setEndpointNameDraft(selectedEp.name);
                setEditingEndpointName(true);
              }}
              className="p-2 rounded-lg border transition-colors hover:bg-white/5 select-none shrink-0"
              style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
            >
              <IconEdit />
            </button>
          )}
        </>
      )}
    </div>
  );
}
