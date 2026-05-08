'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from '../shared/SectionLabel';
import { Check } from '../shared/icons';
import { FEATURE_TILES } from '../data';

export function Features() {
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
      id="features"
      className="relative py-28 border-t"
      style={{ background: '#1A1A1A', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        <div className={`anim-fade-up ${vis}`}>
          <SectionLabel>What you get</SectionLabel>

          <h2 className="display-title max-w-xl mx-auto text-center mb-16" style={{ color: '#fff' }}>
            Built for real-world code.
          </h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 anim-fade-up anim-d2 ${vis}`}>
          {/* Hero tile */}
          <div className="premium-card flex flex-col justify-between group relative overflow-hidden h-full">
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(207,254,38,0.05) 0%, transparent 60%)' }}
            />
            <div className="relative">
              <div
                className="w-8 h-8 rounded flex items-center justify-center mb-7"
                style={{ background: 'rgba(207,254,38,0.1)', border: '1px solid rgba(207,254,38,0.25)' }}
              >
                <Check />
              </div>
              <h4 className="text-[17px] font-bold mb-3 transition-colors" style={{ color: '#fff' }}>
                Nothing to configure
              </h4>
              <p
                className="font-medium leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}
              >
                No config files or code labels. Run one command and Rauts scans your project, finding all routes instantly.
              </p>
            </div>
            <div
              className="relative mt-8 font-mono text-[12px] font-semibold"
              style={{ color: 'rgba(207,254,38,0.5)' }}
            >
              $ npm rauts scan
            </div>
          </div>

          {FEATURE_TILES.map(([title, text], i) => (
            <div
              key={i}
              className="premium-card group flex flex-col justify-between h-full"
            >
              <h4 className="text-[17px] font-bold transition-colors" style={{ color: '#fff' }}>
                {title}
              </h4>
              <p
                className="font-medium leading-relaxed mt-4"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
