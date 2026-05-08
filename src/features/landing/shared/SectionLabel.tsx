import React from 'react';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-6 mb-16">
      <div className="h-px flex-1" style={{ background: '#3A3A3A' }} />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.3em]"
        style={{ color: '#CFFE26' }}
      >
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: '#3A3A3A' }} />
    </div>
  );
}
