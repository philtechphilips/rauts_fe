'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from '../shared/SectionLabel';
import { ROADMAP } from '../data';

export function Roadmap() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="roadmap"
      className="relative py-28 overflow-hidden border-t"
      style={{ background: '#1A1A1A', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div
            className="lg:sticky lg:top-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
            }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: 'rgba(207,254,38,0.4)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Roadmap
              </span>
            </div>
            <h2 className="display-title mb-5 max-w-lg" style={{ color: '#fff' }}>
              What is next
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Today we extract clear endpoint lists from your code. Soon we will support schema exports and change history.
            </p>
          </div>

          <div className="relative">
            {/* Background static line */}
            <div
              className="absolute left-0 top-2 bottom-2 w-px"
              style={{ background: '#3A3A3A' }}
            />
            
            {/* Active animated neon green line */}
            <div
              className="absolute left-0 top-2 w-px bg-[#CFFE26] transition-all"
              style={{
                height: visible ? 'calc(100% - 16px)' : '0%',
                transitionDuration: '1800ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 0 10px rgba(207, 254, 38, 0.55)',
              }}
            />

            {ROADMAP.map((item, i) => {
              const isLive = item.q === 'Live';
              return (
                <div key={i} className="relative pl-8 pb-14 last:pb-0 group">
                  {/* Radar ping animation for Live dot */}
                  {isLive && visible && (
                    <span
                      className="absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-sm bg-[#CFFE26] animate-ping opacity-75"
                      style={{ zIndex: 1 }}
                    />
                  )}

                  {/* Popping Dot */}
                  <div
                    className="absolute -left-[4.5px] top-[7px] w-2.5 h-2.5 rounded-sm transition-all duration-700 cursor-default"
                    style={{
                      background: visible ? (isLive ? '#CFFE26' : '#1A1A1A') : '#1A1A1A',
                      border: '1px solid',
                      borderColor: visible ? '#CFFE26' : '#3A3A3A',
                      transform: visible ? 'scale(1)' : 'scale(0)',
                      transitionDelay: `${i * 350}ms`,
                      boxShadow: visible && isLive ? '0 0 10px rgba(207, 254, 38, 0.6)' : 'none',
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#CFFE26';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(207,254,38,0.2)';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.25) rotate(45deg)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = visible ? '#CFFE26' : '#3A3A3A';
                      (e.currentTarget as HTMLElement).style.background = visible ? (isLive ? '#CFFE26' : '#1A1A1A') : '#1A1A1A';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                    }}
                  />

                  {/* Text Container with staggered slide-in transition */}
                  <div
                    className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateX(0)' : 'translateX(24px)',
                      transitionDelay: `${i * 200}ms`,
                    }}
                  >
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.3em] block mb-2.5"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {item.q}
                    </span>
                    <h4
                      className="text-[22px] font-bold mb-2.5 transition-colors"
                      style={{ color: '#fff' }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="font-medium leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
