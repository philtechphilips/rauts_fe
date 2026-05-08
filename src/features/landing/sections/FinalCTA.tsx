'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from '../shared/icons';
import Link from 'next/link';

export function FinalCTA() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      className="relative py-40 overflow-hidden border-t"
      style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
    >
      {/* Accent glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(207,254,38,0.04) 0%, transparent 70%)' }}
        />
      </div>

      <div className={`container-m relative z-10 text-center anim-fade-up ${vis}`}>
        <h2 className="display-title mb-5" style={{ color: '#fff' }}>
          Start understanding.
        </h2>
        <p
          className="mb-12 mx-auto max-w-sm"
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.1rem', lineHeight: '1.6' }}
        >
          No setup steps: run the command once and see your full API list.
        </p>

        {/* Command block */}
        <div
          className="inline-flex items-center gap-5 px-7 py-4 rounded-lg font-mono text-lg md:text-xl cursor-pointer mb-10 transition-colors"
          style={{ background: '#242424', border: '1px solid #3A3A3A' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(207,254,38,0.4)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#3A3A3A')}
        >
          <span className="font-bold" style={{ color: '#CFFE26' }}>$</span>
          <code className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
            npm rauts scan
          </code>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth/register" className="btn-premium flex items-center gap-2">
            Get Early Access <ArrowRight />
          </Link>
          <Link href="/cli-docs" className="btn-ghost">
            View CLI Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
