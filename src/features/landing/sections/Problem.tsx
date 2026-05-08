'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { SectionLabel } from '../shared/SectionLabel';
import { ChevronDown } from '../shared/icons';
import { PROBLEM_ROWS } from '../data';

export function Problem() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [openId, setOpenId] = useState<number | null>(0);
  const baseId = useId();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative py-28 overflow-hidden border-t"
      style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
    >
      <div
        className="pointer-events-none absolute top-20 left-1/2 h-72 w-[min(92vw,560px)] -translate-x-1/2 rounded-full blur-3xl animate-pulse-glow"
        style={{ background: 'radial-gradient(ellipse, rgba(207,254,38,0.09) 0%, transparent 72%)' }}
      />

      <div className="container-m relative">
        <div className={`anim-fade-up ${vis}`}>
          <SectionLabel>The Problem</SectionLabel>
        </div>

        <h2
          className={`display-title max-w-2xl mb-6 text-center mx-auto anim-fade-up anim-d1 ${vis}`}
          style={{ color: '#fff' }}
        >
          Your API should be<br />easy to understand.
        </h2>
        <p
          className={`mb-14 text-center text-[15px] max-w-lg mx-auto leading-relaxed anim-fade-up anim-d1 ${vis}`}
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Tap a row to see how Rauts helps.
        </p>

        <div
          className={`rounded-xl overflow-hidden border anim-fade-up anim-d2 ${vis}`}
          style={{
            borderColor: '#3A3A3A',
            boxShadow: visible ? '0 0 42px -18px rgba(207,254,38,0.07)' : undefined,
            transition: 'box-shadow 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          role="list"
        >
          {PROBLEM_ROWS.map((row, i) => {
            const isOpen = openId === i;
            const panelId = `${baseId}-panel-${i}`;
            const labelId = `${baseId}-label-${i}`;

            return (
              <div
                key={i}
                role="listitem"
                className="border-b last:border-b-0"
                style={{ borderColor: '#3A3A3A' }}
              >
                <button
                  type="button"
                  id={labelId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId((prev) => (prev === i ? null : i))}
                  className={[
                    'group relative flex w-full flex-col gap-0 text-left outline-none transition-colors duration-300',
                    'px-5 py-5 sm:px-6 sm:py-6 cursor-pointer',
                    'focus-visible:ring-2 focus-visible:ring-[#CFFE26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]',
                    isOpen
                      ? 'bg-[#242424] shadow-[inset_3px_0_0_0_#CFFE26]'
                      : 'bg-transparent hover:bg-[#242424]/80',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 md:gap-12">
                    <span
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-colors duration-300',
                        isOpen
                          ? 'border-[rgba(207,254,38,0.45)]'
                          : 'border-[rgba(207,254,38,0.2)] group-hover:border-[rgba(207,254,38,0.35)]',
                      ].join(' ')}
                      style={{
                        color: '#CFFE26',
                        background: isOpen ? 'rgba(207,254,38,0.14)' : 'rgba(207,254,38,0.08)',
                        border: '1px solid',
                        borderColor: isOpen ? 'rgba(207,254,38,0.45)' : 'rgba(207,254,38,0.2)',
                      }}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 md:gap-16">
                      <p
                        className="flex-1 text-[16px] md:text-lg font-medium leading-snug text-pretty transition-colors duration-300"
                        style={{ color: isOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.72)' }}
                      >
                        {row.text}
                      </p>

                      <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
                        <span
                          className={[
                            'rounded-md border px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] sm:min-w-34 sm:px-3 transition-colors duration-300',
                            isOpen ? 'border-[rgba(207,254,38,0.35)]' : '',
                          ].join(' ')}
                          style={{
                            color: 'rgba(207,254,38,0.75)',
                            borderColor: isOpen ? 'rgba(207,254,38,0.35)' : 'rgba(58,58,58,0.9)',
                            background: 'rgba(26,26,26,0.6)',
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          className={[
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300',
                            isOpen ? 'rotate-180 border-[rgba(207,254,38,0.35)]' : 'rotate-0 border-[rgba(58,58,58,0.9)]',
                          ].join(' ')}
                          style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(26,26,26,0.6)' }}
                        >
                          <ChevronDown className="opacity-90" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={labelId}
                    className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t sm:pl-15 sm:ml-0" style={{ borderColor: 'rgba(58,58,58,0.5)' }}>
                        <p
                          className="px-0 pb-5 pt-4 text-[14px] leading-relaxed sm:pb-6 sm:pt-5 sm:pr-14 sm:text-[15px]"
                          style={{ color: 'rgba(255,255,255,0.45)' }}
                        >
                          {row.payoff}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <p
          className={`mt-14 text-xl md:text-2xl font-semibold italic max-w-xl leading-relaxed anim-fade-up anim-d3 ${vis}`}
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          &ldquo;What used to take an afternoon now takes a minute.&rdquo;
        </p>
      </div>
    </section>
  );
}
