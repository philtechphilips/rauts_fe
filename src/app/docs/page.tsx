'use client';

import Link from 'next/link';
import { RautsLogo } from '@/components/common/Logo';

export default function DocsLandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#0D0D0D', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}
    >
      {/* Background glowing layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[#CFFE26]/5 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full z-10 flex flex-col items-center text-center">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8">
          <RautsLogo className="w-10 h-10 shrink-0" />
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#E8E8F0' }}>Rauts Docs</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-3">
          Instant API Documentation
        </h1>
        
        <p className="text-[13px] text-white/40 leading-relaxed mb-8">
          Welcome to the Rauts Documentation Engine. You can generate, preview, and share beautifully-crafted, interactive API reference portals from your backend scan.
        </p>

        {/* Instructions */}
        <div 
          className="w-full text-left rounded-2xl border p-5 mb-8 space-y-4"
          style={{ borderColor: '#222', background: 'rgba(20,20,20,0.5)', backdropFilter: 'blur(10px)' }}
        >
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-1">
            How to Access Your API Docs
          </h3>
          
          <div className="flex gap-4 items-start">
            <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-[10px] text-[#CFFE26]">
              1
            </div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              Open your dashboard at <Link href="/dashboard" className="text-[#CFFE26] underline font-medium">/dashboard</Link>.
            </p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-[10px] text-[#CFFE26]">
              2
            </div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              Select any collection and click the <strong className="text-white font-semibold">"View Docs"</strong> button on the header.
            </p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-[10px] text-[#CFFE26]">
              3
            </div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              Toggle <strong className="text-white font-semibold">"Publish Documentation"</strong> on the collection card to share it publicly!
            </p>
          </div>
        </div>

        {/* Buttons */}
        <Link 
          href="/dashboard"
          className="w-full py-3.5 px-6 rounded-xl font-bold text-black text-center text-xs transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_20px_rgba(207,254,38,0.25)]"
          style={{ background: '#CFFE26' }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
