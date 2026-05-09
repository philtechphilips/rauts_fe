'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from '../shared/SectionLabel';

const QUICKSTART = [
  {
    step: '01',
    title: 'Install globally',
    command: 'npm install -g rauts-cli',
    note: 'Install once, then use the `rauts` command anywhere.',
  },
  {
    step: '02',
    title: 'Login',
    command: 'rauts login',
    note: 'This opens browser auth and stores your local CLI session.',
  },
  {
    step: '03',
    title: 'Scan your project',
    command: 'rauts scan',
    note: 'Runs route discovery and syncs your API to the dashboard.',
  },
];

export function CliQuickstartSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      id="quickstart"
      className="relative py-28 border-t"
      style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div className={`anim-fade-left anim-d1 ${vis}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: 'rgba(207,254,38,0.4)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                CLI Quickstart
              </span>
            </div>
            <h2 className="display-title mb-5" style={{ color: '#fff' }}>
              Start in 3 commands.
            </h2>
            <p className="text-sub max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Install, login, and scan. That is all you need to generate and sync your API map.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {QUICKSTART.map((item, i) => (
              <div
                key={item.step}
                className={`rounded-xl border p-6 anim-fade-up ${i === 0 ? 'anim-d1' : i === 1 ? 'anim-d2' : 'anim-d3'} ${vis}`}
                style={{ background: '#242424', borderColor: '#3A3A3A' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-4" style={{ color: '#CFFE26' }}>
                  Step {item.step}
                </p>
                <h3 className="text-[18px] font-semibold mb-3" style={{ color: '#fff' }}>
                  {item.title}
                </h3>
                <div
                  className="rounded-md border px-3 py-2.5 font-mono text-[12px] break-all"
                  style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.82)' }}
                >
                  {item.command}
                </div>
                <p className="mt-3 text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
