'use client';

type ClearHistoryModalProps = {
  open: boolean;
  accountBacked: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ClearHistoryModal({
  open,
  accountBacked,
  onCancel,
  onConfirm,
}: ClearHistoryModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-history-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
        style={{ background: '#242424', borderColor: '#3A3A3A' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="clear-history-title" className="text-lg font-semibold text-white mb-2">
          Clear request history?
        </h2>
        <p
          className="text-[13px] leading-relaxed mb-6"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {accountBacked
            ? 'All entries in this list will be removed from your account. This cannot be undone.'
            : 'All entries in this list will be removed from this browser. This cannot be undone.'}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.65)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors hover:bg-red-500/15"
            style={{
              borderColor: 'rgba(248,113,113,0.45)',
              background: 'rgba(248,113,113,0.12)',
              color: 'rgba(252,165,165,0.95)',
            }}
          >
            Clear history
          </button>
        </div>
      </div>
    </div>
  );
}
