'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from '../shared/SectionLabel';
import { HOW_IT_WORKS } from '../data';

const AUTO_ADVANCE_MS = 3200;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
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

  useEffect(() => {
    let accumulated = 0;
    let lastT = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      if (paused) {
        lastT = now;
        frame = requestAnimationFrame(tick);
        return;
      }
      accumulated += now - lastT;
      lastT = now;

      if (accumulated >= AUTO_ADVANCE_MS) {
        setActive((prev) => (prev + 1) % HOW_IT_WORKS.length);
        setStepProgress(0);
        accumulated = 0;
      } else {
        setStepProgress(accumulated / AUTO_ADVANCE_MS);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, paused]);

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="relative py-28 border-t"
      style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        {/* Header Block with anim classes */}
        <div className={`anim-fade-up ${vis}`}>
          <SectionLabel>How It Works</SectionLabel>

          <div className="mb-16 text-center">
            <h2 className="display-title mb-5 max-w-2xl mx-auto" style={{ color: '#fff' }}>
              Three steps to automation.
            </h2>
            <p className="max-w-2xl text-[15px] mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              We inspect your project structure and routing files directly from source code. No server setup is required, and there is zero performance overhead.
            </p>
          </div>
        </div>

        {/* Content Block with anim classes */}
        <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.25fr] anim-fade-up anim-d2 ${vis}`}>
          <div
            className="rounded-xl border p-4 sm:p-5"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
            role="tablist"
            aria-label="How it works steps"
          >
            {HOW_IT_WORKS.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.step}
                  id={`workflow-tab-${i}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`workflow-panel-${i}`}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setStepProgress(0);
                  }}
                  className="group mb-2 flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFFE26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]"
                  style={{
                    background: isActive ? 'rgba(207,254,38,0.08)' : 'rgba(26,26,26,0.5)',
                    borderColor: isActive ? 'rgba(207,254,38,0.45)' : '#3A3A3A',
                  }}
                >
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-widest"
                    style={{
                      color: '#CFFE26',
                      background: isActive ? 'rgba(207,254,38,0.18)' : 'rgba(207,254,38,0.08)',
                      border: `1px solid ${isActive ? 'rgba(207,254,38,0.45)' : 'rgba(207,254,38,0.2)'}`,
                    }}
                  >
                    {s.step}
                  </span>
                  <span className="text-[14px] font-semibold" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="rounded-xl border p-5 sm:p-6"
            style={{ background: '#242424', borderColor: 'rgba(207,254,38,0.25)' }}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            role="tabpanel"
            id={`workflow-panel-${active}`}
            aria-labelledby={`workflow-tab-${active}`}
          >
            <div className="mb-4 h-1 w-full overflow-hidden rounded-full" style={{ background: '#3A3A3A' }}>
              <div
                className="h-full rounded-full transition-[width] duration-150"
                style={{
                  width: `${Math.min(100, stepProgress * 100)}%`,
                  background: '#CFFE26',
                  opacity: paused ? 0.45 : 0.95,
                }}
              />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(207,254,38,0.75)' }}>
              Step {HOW_IT_WORKS[active].step}
            </p>
            <h4 className="mt-2 text-xl font-bold" style={{ color: '#fff' }}>
              {HOW_IT_WORKS[active].title}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>
              {HOW_IT_WORKS[active].desc}
            </p>
            <div
              className="mt-4 inline-flex rounded px-3 py-2 font-mono text-[12px] font-semibold"
              style={{ background: '#1A1A1A', border: '1px solid #3A3A3A', color: 'rgba(207,254,38,0.75)' }}
            >
              {HOW_IT_WORKS[active].cmd}
            </div>
            <p className="mt-3 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {paused ? 'Paused while you read. Move pointer out to continue.' : 'Auto-playing. Hover this panel to pause.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
