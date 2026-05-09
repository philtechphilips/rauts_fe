'use client';

import { useEffect, useRef, useState } from 'react';
import { AUDIENCE_ROWS } from '../data';

export function Audience() {
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
      id="audience"
      className="relative py-28 border-t"
      style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
          {/* Left Column with anim classes */}
          <div className={`anim-fade-up ${vis}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: 'rgba(207,254,38,0.4)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Audience
              </span>
            </div>
            <h2 className="display-title mb-6" style={{ color: '#fff' }}>
              Built for<br />engineers.
            </h2>
            <p className="text-sub max-w-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>
              Whether you are an individual developer or leading an enterprise platform team, Rauts keeps everyone aligned.
            </p>
          </div>

          {/* Right Column with anim classes */}
          <div className={`border-t anim-fade-up anim-d2 ${vis}`} style={{ borderColor: '#3A3A3A' }}>
            {AUDIENCE_ROWS.map(([who, why], i) => (
              <div
                key={i}
                className="group flex items-center gap-6 md:gap-10 py-6 border-b transition-colors cursor-default"
                style={{ borderColor: '#3A3A3A' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#242424')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                />
                <p
                  className="flex-1 font-semibold text-[15px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  {who}
                </p>
                <span
                  className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.2em] shrink-0"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {why}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
