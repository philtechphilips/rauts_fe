'use client';

import Link from 'next/link';
import { RautsLogo } from '@/components/common/Logo';

export function AuthChrome({
  children,
  title,
  subtitle,
  footer = 'ROUTIQ SECURE AUTH // ENCRYPTED SESSION',
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: string;
}) {
  return (
    <div
      className="min-h-screen text-white selection:bg-[#CFFE26] selection:text-black flex flex-col relative overflow-hidden"
      style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(207,254,38,0.05) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
        }}
      />

      <header
        className="relative z-10 border-b px-6 h-14 flex items-center shrink-0"
        style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}
      >
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <RautsLogo className="w-6 h-6 transition-opacity group-hover:opacity-90" />
          <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Rauts
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 min-h-0 gap-8">
        {(title || subtitle) && (
          <div className="w-full max-w-md text-center">
            {title && (
              <h1
                className="display-title mb-2 text-white"
                style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)', lineHeight: 1.2 }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      <footer className="py-8 text-center relative z-10 border-t shrink-0" style={{ borderColor: '#3A3A3A' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
          {footer}
        </p>
      </footer>
    </div>
  );
}
