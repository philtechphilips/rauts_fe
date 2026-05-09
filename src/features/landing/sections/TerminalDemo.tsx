'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from '../shared/icons';
import { MethodTag } from '../shared/MethodTag';
import { DEMO_BENEFITS, ENDPOINTS } from '../data';

const CMD = 'npx rauts scan';
/** Full demo loop (typing → logs → endpoints → done → hold). */
const CYCLE_MS = 9500;

export function TerminalDemo() {
  const [t, setT] = useState(0);
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
    let localT = 0;
    let lastT = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      localT += now - lastT;
      lastT = now;
      if (localT >= CYCLE_MS) localT %= CYCLE_MS;
      setT(localT);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const msPerChar = 42;
  const cmdPhaseEnd = CMD.length * msPerChar;
  const cmdVisible = CMD.slice(0, Math.min(CMD.length, Math.floor(t / msPerChar)));
  const showTypingCursor = t < cmdPhaseEnd + 120;

  const afterCmd = cmdPhaseEnd + 280;
  const showLog1 = t >= afterCmd;
  const showLog2 = t >= afterCmd + 320;
  const showLog3 = t >= afterCmd + 640;
  const showFound = t >= afterCmd + 980;

  const epBase = afterCmd + 1180;
  const epGap = 210;
  const epClamp =
    t < epBase ? 0 : Math.min(ENDPOINTS.length, Math.floor((t - epBase) / epGap) + 1);

  const doneAt = epBase + ENDPOINTS.length * epGap + 320;
  const showDone = t >= doneAt;

  const vis = visible ? 'is-visible' : '';

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="relative py-28 overflow-hidden border-t"
      style={{ background: '#1A1A1A', borderColor: '#3A3A3A' }}
    >
      <div className="container-m relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-16 lg:gap-24 items-start">
          {/* Left: copy */}
          <div className={`lg:sticky lg:top-24 anim-fade-up ${vis}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: 'rgba(207,254,38,0.4)' }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Meet Rauts
              </span>
            </div>
            <h2 className="display-title mb-6" style={{ color: '#fff' }}>
              See your API.<br />Instantly.
            </h2>
            <p
              className="text-sub mb-10"
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}
            >
              Run one command. Rauts reads your code and shows every route and HTTP method it finds.
            </p>
            <div className="space-y-3">
              {DEMO_BENEFITS.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(207,254,38,0.1)', border: '1px solid rgba(207,254,38,0.25)' }}
                  >
                    <Check />
                  </div>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal */}
          <div className={`relative anim-fade-up anim-d2 ${vis}`}>
            <div
              className="absolute -inset-6 rounded-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(207,254,38,0.04) 0%, transparent 70%)' }}
            />
            <div
              className="relative rounded-xl overflow-hidden border"
              style={{ background: '#1E1E1E', borderColor: '#3A3A3A' }}
            >
              <div className="scanline" />

              {/* Title bar */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    ~/my-backend — rauts scan
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-7 font-mono text-[13px] min-h-[380px] space-y-2">
                <div className="flex items-center gap-3 min-h-5">
                  <span className="font-bold shrink-0" style={{ color: '#CFFE26' }}>$</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {cmdVisible}
                    {showTypingCursor && (
                      <span
                        className="inline-block w-2 h-4 ml-0.5 align-text-bottom animate-pulse"
                        style={{ background: '#CFFE26', opacity: 0.75 }}
                      />
                    )}
                  </span>
                </div>

                {showLog1 && (
                  <div
                    className="text-[12px] space-y-1 py-3 pl-5"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    <div>Scanning project...</div>
                    {showLog2 && (
                      <div>
                        Detecting framework:{' '}
                        <span style={{ color: 'rgba(207,254,38,0.5)' }}>Fastify v4.x</span>
                      </div>
                    )}
                    {showLog3 && (
                      <div>
                        Scanning:{' '}
                        <span style={{ color: 'rgba(207,254,38,0.5)' }}>routes/</span>,{' '}
                        <span style={{ color: 'rgba(207,254,38,0.5)' }}>controllers/</span>
                      </div>
                    )}
                  </div>
                )}

                {showFound && (
                  <div className="pt-1 pb-3 border-t" style={{ borderColor: '#3A3A3A' }}>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Found 6 endpoints
                    </span>
                  </div>
                )}

                {showFound && epClamp > 0 && (
                  <div className="space-y-2.5">
                    {ENDPOINTS.slice(0, epClamp).map((ep, i) => {
                      const rowT = t - epBase - i * epGap;
                      const fill = Math.min(1, Math.max(0, rowT / 180)) * ep.confidence;
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <MethodTag method={ep.method} />
                          <span
                            className="flex-1 text-[12px]"
                            style={{ color: 'rgba(255,255,255,0.55)' }}
                          >
                            {ep.path}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-1 rounded-full w-16" style={{ background: '#3A3A3A' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${fill}%`, background: '#CFFE26', opacity: 0.65 }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-semibold tabular-nums w-8 text-right"
                              style={{ color: 'rgba(255,255,255,0.35)' }}
                            >
                              {Math.round(fill)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {showDone && (
                  <div
                    className="pt-5 border-t flex items-center gap-3"
                    style={{ borderColor: '#3A3A3A' }}
                  >
                    <span className="font-bold text-[12px]" style={{ color: 'rgba(207,254,38,0.7)' }}>✓</span>
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Completed in <span style={{ color: 'rgba(207,254,38,0.7)' }}>1.24s</span>
                    </span>
                  </div>
                )}

                <p className="pt-4 text-[10px] font-medium font-sans" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Live CLI preview — loops automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
