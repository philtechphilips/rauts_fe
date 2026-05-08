import { RautsLogo } from '@/components/common/Logo';

export function Footer() {
  return (
    <footer
      className="py-10 border-t"
      style={{ background: '#242424', borderColor: '#3A3A3A' }}
    >
      <div className="container-m flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <RautsLogo className="w-6 h-6" />
          <span
            className="text-[14px] font-semibold tracking-tight"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Rauts
          </span>
        </div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          Built for teams that ship often
        </p>
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.12)' }}
        >
          Rauts © 2026
        </p>
      </div>
    </footer>
  );
}
