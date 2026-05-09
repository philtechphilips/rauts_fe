'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from '../shared/icons';
import { ACTIVE_SCAN_FRAMEWORKS, FRAMEWORKS } from '../data';

const CLI_CMD = 'npm rauts scan';

export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCli = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CLI_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Accent glow */}
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(207,254,38,0.05) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
        }}
      />

      <div className="container-m relative z-10 flex-1 flex flex-col justify-center py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2.5 mb-10 px-4 py-2 rounded-full"
            style={{ background: '#242424', border: '1px solid #3A3A3A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#CFFE26' }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              CLI · GitHub · No setup
            </span>
          </div>

          {/* Headline */}
          <h1 className="display-title mb-7" style={{ color: '#fff' }}>
            Understand any<br />
            <em className="not-italic" style={{ color: '#CFFE26' }}>backend API</em><br />
            in seconds.
          </h1>

          <p className="text-sub mb-12 max-w-[520px] mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Point Rauts at your project. It lists every API route for you—no manual docs and no hunt through the code.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link href="/auth/register" className="btn-premium flex items-center gap-2">
              Try it now <ArrowRight />
            </Link>
            <button
              type="button"
              onClick={copyCli}
              className="flex items-center gap-3 px-5 py-3 rounded-lg font-mono text-[13px] cursor-pointer transition-colors"
              style={{
                background: '#242424',
                border: `1px solid ${copied ? 'rgba(207,254,38,0.45)' : '#3A3A3A'}`,
                color: 'rgba(255,255,255,0.6)',
              }}
              onMouseEnter={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(207,254,38,0.4)';
              }}
              onMouseLeave={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = '#3A3A3A';
              }}
              aria-label={copied ? 'Copied command' : 'Copy install command'}
            >
              <span className="font-bold w-4 inline-flex justify-center" style={{ color: '#CFFE26' }} aria-hidden>
                {copied ? '✓' : '$'}
              </span>
              <code>{CLI_CMD}</code>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Copied to clipboard' : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Framework ticker */}
      <div
        className="relative z-10 overflow-hidden shrink-0 border-t"
        style={{ background: '#242424', borderColor: '#3A3A3A' }}
      >
        <div className="ticker-track">
          {[...FRAMEWORKS, ...FRAMEWORKS].map((fw, i) => {
            const isActive = ACTIVE_SCAN_FRAMEWORKS.has(fw);
            return (
              <div
                key={i}
                className="flex items-center gap-4 px-10 py-3.5 shrink-0 border-r"
                style={{ borderColor: '#3A3A3A' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                  style={{
                    background: isActive ? '#CFFE26' : 'rgba(255,255,255,0.12)',
                    boxShadow: isActive ? '0 0 8px #CFFE26' : 'none',
                  }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.25em] whitespace-nowrap transition-colors"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.22)' }}
                >
                  {fw}
                </span>
                {isActive ? (
                  <span
                    className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 select-none"
                    style={{
                      background: 'rgba(207,254,38,0.12)',
                      color: '#CFFE26',
                      border: '1px solid rgba(207,254,38,0.22)',
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    className="text-[8px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 select-none"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      color: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
