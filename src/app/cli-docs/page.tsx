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
  {
    title: 'Local Proxy',
    cmd: 'rauts local',
    desc: 'Starts the local proxy to safely forward and test localhost playground requests from the cloud dashboard.',
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
      </div>
    </div>
  );
}
