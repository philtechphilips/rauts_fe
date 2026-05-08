import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'CLI documentation',
  description: `Install, authenticate with ${siteConfig.shortName}, scan your project, and sync API routes to the dashboard.`,
  alternates: { canonical: '/cli-docs' },
  robots: { index: true, follow: true },
  openGraph: {
    title: `CLI documentation | ${siteConfig.shortName}`,
    description: `Install, authenticate with ${siteConfig.shortName}, scan your project, and sync API routes to the dashboard.`,
    url: '/cli-docs',
    type: 'article',
  },
};

const COMMANDS = [
  {
    title: 'Install',
    cmd: 'npm install -g rauts-cli',
    desc: 'Install the CLI globally so the `rauts` command works from any folder.',
  },
  {
    title: 'Login',
    cmd: 'rauts login',
    desc: 'Starts browser authentication and stores your local CLI session.',
  },
  {
    title: 'Scan',
    cmd: 'rauts scan',
    desc: 'Scans the current project, enriches endpoint metadata, and syncs to dashboard.',
  },
];

export default function CliDocsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#1A1A1A', color: '#fff' }}>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-[#CFFE26]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <span>←</span> Return to Home
          </Link>
        </div>

        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: '#CFFE26' }}>
          CLI Documentation
        </p>
        <h1 className="display-title mb-5" style={{ color: '#fff' }}>
          Rauts CLI
        </h1>
        <p className="mb-12 max-w-2xl text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Use Rauts CLI to authenticate, scan your backend, and sync endpoint docs to your dashboard in minutes.
        </p>

        <section className="space-y-4">
          {COMMANDS.map((item, i) => (
            <div key={item.title} className="rounded-xl border p-6" style={{ borderColor: '#3A3A3A', background: '#242424' }}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: '#CFFE26' }}>
                Step {String(i + 1).padStart(2, '0')}
              </p>
              <h2 className="mb-3 text-[19px] font-semibold">{item.title}</h2>
              <div
                className="rounded-md border px-3 py-2.5 font-mono text-[13px] break-all"
                style={{ background: '#1A1A1A', borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.86)' }}
              >
                {item.cmd}
              </div>
              <p className="mt-3 text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-xl border p-6" style={{ borderColor: '#3A3A3A', background: '#242424' }}>
          <h3 className="mb-3 text-[18px] font-semibold">Extra commands</h3>
          <div className="space-y-3 text-[13px]">
            <div>
              <p className="mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Check version
              </p>
              <code className="font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                rauts --version
              </code>
            </div>
            <div>
              <p className="mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Scan a specific folder
              </p>
              <code className="font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                rauts scan ./services/api
              </code>
            </div>
            <div>
              <p className="mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Export HTML docs file
              </p>
              <code className="font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
                rauts scan --export
              </code>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
