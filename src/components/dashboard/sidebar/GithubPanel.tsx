'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';
import { useDashboard } from '../DashboardContext';

type GithubStatus = { connected: boolean; githubLogin: string | null };
type RepoRow = { fullName: string; defaultBranch: string; private: boolean };

type ScanJobPoll = {
  status: string;
  errorMessage?: string | null;
  result?: {
    message?: string;
    collectionName?: string;
    endpointCount?: number;
    branch?: string;
  } | null;
};

type ScanNoticeTone = 'info' | 'success' | 'error';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function GithubPanel() {
  const { refreshCollections } = useDashboard();
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [scanBusy, setScanBusy] = useState(false);
  const [repoSelectOpen, setRepoSelectOpen] = useState(false);
  const [scanNotice, setScanNotice] = useState<{
    title: string;
    message: string;
    tone: ScanNoticeTone;
  } | null>(null);
  const repoSelectRef = useRef<HTMLDivElement | null>(null);

  const selectedRepoFullName = owner && repo ? `${owner}/${repo}` : '';
  const selectedRepoRow = repos.find((r) => r.fullName === selectedRepoFullName) ?? null;

  const loadStatus = useCallback(async () => {
    setLoadErr(null);
    try {
      const s = (await api.get('/github/status')) as GithubStatus;
      setStatus(s);
    } catch (e: unknown) {
      setStatus({ connected: false, githubLogin: null });
      setLoadErr(e instanceof Error ? e.message : 'Could not load GitHub status');
    }
  }, []);

  const loadRepos = useCallback(async () => {
    try {
      const res = (await api.get('/github/repos')) as { repos?: RepoRow[] };
      setRepos(Array.isArray(res.repos) ? res.repos : []);
    } catch {
      setRepos([]);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status?.connected) void loadRepos();
  }, [status?.connected, loadRepos]);

  useEffect(() => {
    if (!repoSelectOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!repoSelectRef.current) return;
      if (!repoSelectRef.current.contains(event.target as Node)) {
        setRepoSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [repoSelectOpen]);

  const startConnect = async () => {
    setLoadErr(null);
    try {
      const res = (await api.post('/github/oauth/start', {})) as { authorizeUrl?: string };
      if (res.authorizeUrl) {
        window.location.href = res.authorizeUrl;
        return;
      }
      setLoadErr('GitHub OAuth is not configured on the server.');
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Could not start GitHub connect');
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect GitHub from your Rauts account?')) return;
    setLoadErr(null);
    try {
      await api.post('/github/disconnect', {});
      setStatus({ connected: false, githubLogin: null });
      setRepos([]);
      setOwner('');
      setRepo('');
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Disconnect failed');
    }
  };

  const applyRepo = (fullName: string, defBranch: string) => {
    const [o, r] = fullName.split('/');
    if (o && r) {
      setOwner(o);
      setRepo(r);
      setBranch(defBranch || '');
      setCollectionName(fullName);
      setRepoSelectOpen(false);
    }
  };

  const pollScanJob = async (jobId: string, fallbackTitle: string) => {
    try {
      for (;;) {
        await sleep(3000);
        const j = (await api.get(`/github/scan/jobs/${jobId}`)) as ScanJobPoll;
        if (j.status === 'completed') {
          const r = j.result;
          const title = (r?.collectionName as string | undefined) ?? fallbackTitle;
          setScanNotice({
            title: 'Import complete',
            message:
              (r?.message as string | undefined) ||
              `Synced ${r?.endpointCount ?? 0} endpoints to “${title}”.`,
            tone: 'success',
          });
          await refreshCollections();
          return;
        }
        if (j.status === 'failed') {
          setScanNotice({
            title: 'Import failed',
            message: j.errorMessage || 'Scan failed.',
            tone: 'error',
          });
          return;
        }
      }
    } catch (e: unknown) {
      setScanNotice({
        title: 'Could not check status',
        message:
          e instanceof Error
            ? e.message
            : 'Could not load scan status (check your inbox for the result email).',
        tone: 'error',
      });
    }
  };

  const runScan = async () => {
    const o = owner.trim();
    const r = repo.trim();
    if (!o || !r) {
      setScanNotice({
        title: 'Missing repository',
        message: 'Enter owner and repository name.',
        tone: 'error',
      });
      return;
    }
    setScanBusy(true);
    setScanNotice(null);
    try {
      const body: Record<string, string> = { owner: o, repo: r };
      const b = branch.trim();
      if (b) body.branch = b;
      const cn = collectionName.trim();
      if (cn) body.collectionName = cn;
      const res = (await api.post('/github/scan', body)) as {
        jobId?: string;
        status?: string;
        message?: string;
      };
      const fallbackTitle = cn || `${o}/${r}`;
      if (res.jobId) {
        setScanNotice({
          title: 'Import queued',
          message:
            res.message ||
            'Your import is queued. We will email you when it finishes, and this panel will keep checking status.',
          tone: 'info',
        });
        void pollScanJob(res.jobId, fallbackTitle);
      } else {
        setScanNotice({
          title: 'Unexpected response',
          message: 'Unexpected response from server.',
          tone: 'error',
        });
      }
    } catch (e: unknown) {
      setScanNotice({
        title: 'Scan failed',
        message: e instanceof Error ? e.message : 'Scan failed',
        tone: 'error',
      });
    } finally {
      setScanBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full select-none overflow-hidden">
      <div
        className="flex items-center px-3 h-9 shrink-0 border-b"
        style={{ borderColor: '#3A3A3A' }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          GitHub
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-[12px]">
        {loadErr && (
          <p className="text-[11px] leading-relaxed" style={{ color: '#F93E3E' }}>
            {loadErr}
          </p>
        )}

        {!status?.connected ? (
          <div className="space-y-2">
            <p style={{ color: 'rgba(255,255,255,0.38)' }}>
              Connect GitHub to scan a repository in the cloud (same discovery + AI enrichment as{' '}
              <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                rauts scan
              </span>
              ). Requires OAuth app env on the server.
            </p>
            <button
              type="button"
              onClick={() => void startConnect()}
              className="w-full rounded-lg py-2.5 font-semibold text-black"
              style={{ background: '#CFFE26' }}
            >
              Connect GitHub
            </button>
          </div>
        ) : (
          <>
            <div
              className="rounded-lg border p-2.5"
              style={{ borderColor: '#3A3A3A', background: 'rgba(26,26,26,0.6)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold uppercase"
                    style={{
                      background: 'rgba(207,254,38,0.12)',
                      border: '1px solid rgba(207,254,38,0.28)',
                      color: '#CFFE26',
                    }}
                    aria-hidden
                  >
                    {status.githubLogin?.[0] ?? 'G'}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-[0.14em] font-semibold mb-1"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      GitHub connected
                    </p>
                    <p
                      className="text-[12px] font-semibold truncate"
                      style={{ color: 'rgba(255,255,255,0.82)' }}
                      title={status.githubLogin ?? ''}
                    >
                      @{status.githubLogin}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void disconnect()}
                  className="shrink-0 rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-white/5"
                  style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.55)' }}
                >
                  Disconnect
                </button>
              </div>
              <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Imports use this account&apos;s repository access.
              </p>
            </div>

            {repos.length > 0 && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Your repos
                </label>
                <div className="relative" ref={repoSelectRef}>
                  <button
                    type="button"
                    className="w-full rounded border px-2 py-1.5 text-[12px] text-left outline-none flex items-center justify-between gap-2"
                    style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.75)', background: '#1A1A1A' }}
                    onClick={() => setRepoSelectOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={repoSelectOpen}
                  >
                    <span className="truncate">
                      {selectedRepoRow
                        ? `${selectedRepoRow.fullName}${selectedRepoRow.private ? ' · private' : ''}`
                        : 'Pick a repo...'}
                    </span>
                    <span aria-hidden style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {repoSelectOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  {repoSelectOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded border"
                      style={{ borderColor: '#3A3A3A', background: '#1A1A1A' }}
                      role="listbox"
                    >
                      {repos.map((r) => (
                        <button
                          key={r.fullName}
                          type="button"
                          className="w-full px-2 py-2 text-left text-[12px] border-b last:border-b-0 hover:bg-white/5 transition-colors"
                          style={{ borderColor: '#2E2E2E', color: 'rgba(255,255,255,0.78)' }}
                          onClick={() => applyRepo(r.fullName, r.defaultBranch)}
                          role="option"
                          aria-selected={selectedRepoFullName === r.fullName}
                        >
                          {r.fullName}
                          {r.private ? ' · private' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Scan from GitHub
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="rounded border px-2 py-1.5 font-mono text-[11px] bg-transparent outline-none"
                  style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.8)' }}
                />
                <input
                  placeholder="repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="rounded border px-2 py-1.5 font-mono text-[11px] bg-transparent outline-none"
                  style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.8)' }}
                />
              </div>
              <input
                placeholder="branch (optional — default from GitHub)"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded border px-2 py-1.5 font-mono text-[11px] bg-transparent outline-none"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.8)' }}
              />
              <input
                placeholder="collection name (optional)"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-[11px] bg-transparent outline-none"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.8)' }}
              />
              <button
                type="button"
                disabled={scanBusy}
                onClick={() => void runScan()}
                className="w-full rounded-lg py-2 font-semibold text-black disabled:opacity-40"
                style={{ background: '#CFFE26' }}
              >
                {scanBusy ? 'Queuing…' : 'Queue GitHub import'}
              </button>
              <p style={{ color: 'rgba(255,255,255,0.22)' }} className="text-[10px] leading-relaxed">
                The server queues a cloud job: clone, scan, optional AI enrichment, then sync into a collection. You
                do not have to wait — we email you when it is done. This panel also polls for completion if you stay here.
              </p>
            </div>
          </>
        )}

      </div>

      {scanNotice && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="github-scan-notice-title"
          onClick={() => setScanNotice(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
            style={{ background: '#242424', borderColor: '#3A3A3A' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{
                color:
                  scanNotice.tone === 'success'
                    ? 'rgba(207,254,38,0.9)'
                    : scanNotice.tone === 'error'
                      ? 'rgba(249,62,62,0.92)'
                      : 'rgba(255,255,255,0.5)',
              }}
            >
              GitHub scan
            </p>
            <h3 id="github-scan-notice-title" className="text-lg font-semibold text-white">
              {scanNotice.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {scanNotice.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setScanNotice(null)}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors hover:bg-white/5"
                style={{ borderColor: '#3A3A3A', color: 'rgba(255,255,255,0.75)' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
