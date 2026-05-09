'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from '../shared/icons';

const STEPS = [
  {
    title: 'Sign in with GitHub',
    body: "Rauts uses GitHub's normal sign-in. You choose which repos we can access, without copying tokens by hand.",
  },
  {
    title: 'Pick repo and branch',
    body: 'Select the project and branch. The scan runs on our servers, same logic as the CLI—your laptop does not need to stay open.',
  },
  {
    title: 'We work in the background',
    body: 'You can leave the page. When the scan finishes, we email you. If something fails, we email that too.',
  },
  {
    title: 'Your dashboard updates',
    body: 'First-class scans for NestJS, Express, Laravel, Fastify, Koa, Hono, Elysia, and AdonisJS—the same engine as the CLI. When the job completes, new endpoints show up in your collections.',
  },
] as const;

const AUTO_ADVANCE_MS = 3600;

export function GithubConnectSection() {
  const [active, setActive] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const overallProgress = (active + stepProgress) / STEPS.length;

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
      if (hoverPaused) {
        lastT = now;
        frame = requestAnimationFrame(tick);
        return;
      }
      accumulated += now - lastT;
      lastT = now;
      if (accumulated >= AUTO_ADVANCE_MS) {
        setActive((a) => (a + 1) % STEPS.length);
        accumulated = 0;
        setStepProgress(0);
      } else {
        setStepProgress(accumulated / AUTO_ADVANCE_MS);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, hoverPaused]);

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      id="github"
      className="relative py-28 border-t"
      style={{ background: '#1A1A1A', borderColor: '#3A3A3A' }}
    >
      <div className="container-m">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          {/* Left Column */}
          <div className={`anim-fade-up ${vis}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: 'rgba(207,254,38,0.4)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                GitHub Import
              </span>
            </div>
            <h2 className="display-title mb-6 max-w-xl" style={{ color: '#fff' }}>
              Connect GitHub.<br />
              <em className="not-italic" style={{ color: '#CFFE26' }}>
                Scan without the terminal.
              </em>
            </h2>
            <p
              className="mb-8 max-w-lg text-[1.05rem] font-medium leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Create an account, open the GitHub panel, and connect once. Then start a scan from any repo you can
              access. Heavy work runs in the cloud so the app stays fast.
            </p>
            <p className="text-[13px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Already use the CLI? It is the same scanner—now you can run it from the browser too.
            </p>
          </div>

          {/* Right Column */}
          <div
            className={`rounded-xl border p-6 sm:p-8 anim-fade-up anim-d2 ${vis}`}
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
          >
            <p
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ color: 'rgba(207,254,38,0.75)' }}
            >
              What happens
            </p>

            <div
              className="mb-6 h-1 w-full overflow-hidden rounded-full"
              style={{ background: '#3A3A3A' }}
              aria-hidden
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, overallProgress * 100)}%`,
                  background: '#CFFE26',
                  opacity: hoverPaused ? 0.45 : 0.95,
                  boxShadow: '0 0 12px rgba(207, 254, 38, 0.25)',
                }}
              />
            </div>

            <ol className="list-none space-y-2 p-0" aria-label="Import steps">
              {STEPS.map((step, i) => {
                const isActive = active === i;
                return (
                  <li
                    key={step.title}
                    className="flex gap-3 rounded-lg border p-3 sm:p-3.5"
                    style={{
                      borderColor: isActive ? 'rgba(207,254,38,0.45)' : '#3A3A3A',
                      background: isActive ? 'rgba(207,254,38,0.07)' : 'rgba(26,26,26,0.35)',
                      boxShadow: isActive ? '0 0 0 1px rgba(207,254,38,0.08)' : 'none',
                    }}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                      style={{
                        background: isActive
                          ? 'rgba(207,254,38,0.2)'
                          : 'rgba(207,254,38,0.08)',
                        border: `1px solid ${isActive ? 'rgba(207,254,38,0.45)' : 'rgba(207,254,38,0.2)'}`,
                        color: isActive ? '#CFFE26' : 'rgba(255,255,255,0.45)',
                      }}
                      aria-hidden
                    >
                      {isActive ? <Check /> : i + 1}
                    </div>
                    <span
                      className="pt-0.5 text-[13px] font-semibold leading-snug sm:text-[14px]"
                      style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.42)' }}
                    >
                      {step.title}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div
              className="mt-5 min-h-[108px] rounded-lg border p-4"
              style={{
                borderColor: '#3A3A3A',
                background: '#1A1A1A',
              }}
              onPointerEnter={() => setHoverPaused(true)}
              onPointerLeave={() => setHoverPaused(false)}
            >
              <p
                className="text-[13px] font-medium leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                aria-live="polite"
              >
                {STEPS[active].body}
              </p>
              <p className="mt-3 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.22)' }}>
                {hoverPaused
                  ? 'Paused. Move the pointer away to continue the slideshow.'
                  : 'Steps advance on their own. Hover here to pause and read.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
