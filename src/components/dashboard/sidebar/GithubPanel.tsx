'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';
import { useDashboard } from '../DashboardContext';

type GithubStatus = { connected: boolean; githubLogin: string | null };
type GithubAppServerStatus = {
  githubAppConfigured: boolean;
  githubAppSlug: string | null;
  installationLinked: boolean;
  installUrl: string | null;
  appWebhookUrl: string | null;
};
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
  const { refreshCollections, requestSystemConfirm } = useDashboard();
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [scanBusy, setScanBusy] = useState(false);
  const [syncOnPush, setSyncOnPush] = useState(true);
  const [githubAppStatus, setGithubAppStatus] = useState<GithubAppServerStatus | null>(null);
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

  const loadGithubAppStatus = useCallback(async () => {
    try {
      const res = (await api.get('/github/app/status')) as GithubAppServerStatus;
      setGithubAppStatus(res);
    } catch {
      setGithubAppStatus(null);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status?.connected) void loadRepos();
  }, [status?.connected, loadRepos]);

  useEffect(() => {
    if (status?.connected) void loadGithubAppStatus();
  }, [status?.connected, loadGithubAppStatus]);

  /** GitHub App redirects here with ?installation_id= after install (set Setup URL to this dashboard URL). */
  useEffect(() => {
    if (!status?.connected || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const iid = params.get('installation_id');
    if (!iid) return;

    let cancelled = false;
    void (async () => {
      try {
        await api.post('/github/app/link-installation', { installationId: iid });
        if (!cancelled) {
          setScanNotice({
            title: 'GitHub App linked',
            message:
              'This Routiq account is linked to your GitHub App installation. Import a repo with “Auto-sync on push” to refresh docs on every push.',
            tone: 'success',
          });
          await loadGithubAppStatus();
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setScanNotice({
            title: 'Could not link GitHub App',
            message: e instanceof Error ? e.message : 'Link installation failed.',
            tone: 'error',
          });
        }
      } finally {
        if (!cancelled) {
          const path = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', path);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status?.connected, loadGithubAppStatus]);

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
    const ok = await requestSystemConfirm({
      title: 'Disconnect GitHub?',
      message: 'Disconnect GitHub from your Routiq account?',
      confirmLabel: 'Disconnect',
      destructive: true,
    });
    if (!ok) return;
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
      const body: Record<string, string | boolean> = { owner: o, repo: r };
      const b = branch.trim();
      if (b) body.branch = b;
      const cn = collectionName.trim();
      if (cn) body.collectionName = cn;
      if (syncOnPush) body.syncOnPush = true;
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
    <div className="flex-1 flex flex-col h-full overflow-hidden text-white p-8 lg:p-12" style={{ background: '#141414' }}>
      {loadErr && (
        <div className="shrink-0 mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
          <strong>Error:</strong> {loadErr}
        </div>
      )}

      {!status?.connected ? (
        /* NOT CONNECTED WORKSPACE HERO */
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 shadow-2xl">
            {/* GitHub Logo Mark or Icon */}
            <svg className="w-10 h-10 text-white/90" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
            Sync API-Docs Directly with GitHub
          </h1>
          <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-lg">
            Connect Routiq with your GitHub account to import API routes, sync directories in the background, 
            and keep your team&apos;s published documentations live on every repository push.
          </p>
          <button
            type="button"
            onClick={() => void startConnect()}
            className="px-8 py-3.5 rounded-xl font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(207,254,38,0.35)]"
            style={{ background: '#CFFE26' }}
          >
            Connect GitHub Account
          </button>
        </div>
      ) : (
        /* CONNECTED DASHBOARD */
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* HEADER: Account Connection State */}
          <div
            className="shrink-0 rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            style={{ borderColor: '#262626', background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-extrabold uppercase shadow-[0_0_15px_rgba(207,254,38,0.2)]"
                style={{
                  background: 'rgba(207,254,38,0.1)',
                  border: '1px solid rgba(207,254,38,0.3)',
                  color: '#CFFE26',
                }}
              >
                {status.githubLogin?.[0] || 'G'}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                  GitHub Connected
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  @{status.githubLogin}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void disconnect()}
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all hover:bg-red-500/10 hover:text-red-400"
              style={{ borderColor: '#2E2E2E', color: 'rgba(255,255,255,0.45)' }}
            >
              Disconnect
            </button>
          </div>

          {/* TWO COLUMN CONTENT PANEL */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
            
            {/* LEFT COLUMN: Import Form & Picker */}
            <div className="lg:col-span-7 flex flex-col min-h-0 space-y-6">
              
              <div className="border rounded-2xl p-6 space-y-6 flex flex-col min-h-0" style={{ background: '#1A1A1A', borderColor: '#262626' }}>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/40 shrink-0">
                  Import Repository
                </h3>

                {repos.length > 0 && (
                  <div className="shrink-0" ref={repoSelectRef}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                      Select Repository
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full rounded-xl border px-4 py-3 text-[13px] text-left outline-none flex items-center justify-between gap-2"
                        style={{ borderColor: '#2E2E2E', color: '#FFF', background: '#141414' }}
                        onClick={() => setRepoSelectOpen((prev) => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={repoSelectOpen}
                      >
                        <span className="truncate font-medium text-white/80">
                          {selectedRepoRow
                            ? `${selectedRepoRow.fullName}${selectedRepoRow.private ? ' (Private)' : ''}`
                            : 'Pick a GitHub repo to import...'}
                        </span>
                        <span aria-hidden className="text-white/30 text-[10px]">
                          {repoSelectOpen ? '▲' : '▼'}
                        </span>
                      </button>
                      
                      {repoSelectOpen && (
                        <div
                          className="absolute z-50 mt-1 w-full max-h-56 overflow-auto rounded-xl border shadow-2xl"
                          style={{ borderColor: '#2E2E2E', background: '#141414' }}
                          role="listbox"
                        >
                          {repos.map((r) => (
                            <button
                              key={r.fullName}
                              type="button"
                              className="w-full px-4 py-3 text-left text-[12px] font-medium border-b last:border-b-0 hover:bg-white/5 transition-colors"
                              style={{ borderColor: '#222', color: 'rgba(255,255,255,0.75)' }}
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

                {/* Grid Inputs */}
                <div className="shrink-0 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                      Owner
                    </label>
                    <input
                      placeholder="e.g. facebook"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 font-mono text-[12px] outline-none transition-all focus:border-white/20"
                      style={{ background: '#141414', borderColor: '#2E2E2E', color: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                      Repository Name
                    </label>
                    <input
                      placeholder="e.g. react"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 font-mono text-[12px] outline-none transition-all focus:border-white/20"
                      style={{ background: '#141414', borderColor: '#2E2E2E', color: '#FFF' }}
                    />
                  </div>
                </div>

                <div className="shrink-0 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                      Branch <span className="text-white/20 font-medium normal-case">(optional - defaults to repo head)</span>
                    </label>
                    <input
                      placeholder="e.g. main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 font-mono text-[12px] outline-none transition-all focus:border-white/20"
                      style={{ background: '#141414', borderColor: '#2E2E2E', color: '#FFF' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                      Collection Name <span className="text-white/20 font-medium normal-case">(optional)</span>
                    </label>
                    <input
                      placeholder="e.g. Production APIs"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-[12px] outline-none transition-all focus:border-white/20"
                      style={{ background: '#141414', borderColor: '#2E2E2E', color: '#FFF' }}
                    />
                  </div>

                  <div className="flex items-start gap-4 select-none py-3 border-t border-[#222] mt-2">
                    {/* Sliding switch track */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={syncOnPush}
                      onClick={() => setSyncOnPush(!syncOnPush)}
                      className={`w-10 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 flex items-center shrink-0 outline-none focus:ring-1 focus:ring-[#CFFE26]/35 ${
                        syncOnPush ? 'bg-[#CFFE26]' : 'bg-[#141414] border border-[#2E2E2E]'
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 ${
                          syncOnPush ? 'translate-x-4.5 bg-black' : 'bg-white/40'
                        }`}
                      />
                    </button>
                    <div 
                      className="text-[12px] text-white/50 leading-relaxed font-medium cursor-pointer"
                      onClick={() => setSyncOnPush(!syncOnPush)}
                    >
                      {githubAppStatus?.installationLinked
                        ? 'Keep this repo in sync when you push to GitHub'
                        : githubAppStatus?.githubAppConfigured
                          ? 'Keep in sync on push (requires GitHub App install first)'
                          : 'Auto-sync on push triggers'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={scanBusy}
                    onClick={() => void runScan()}
                    className="w-full rounded-xl py-3.5 font-bold text-black transition-all disabled:opacity-35 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: '#CFFE26' }}
                  >
                    {scanBusy ? 'Importing...' : 'Scan & Import Repository'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: App Connection / Status details */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* GitHub App Config Status Card */}
              <div className="border rounded-2xl p-6 space-y-4" style={{ background: '#1A1A1A', borderColor: '#262626' }}>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/40">
                  GitHub App Integration
                </h3>

                {githubAppStatus?.githubAppConfigured && githubAppStatus.installationLinked ? (
                  <div 
                    className="p-5 rounded-xl border relative overflow-hidden transition-all duration-300 hover:shadow-[0_4px_30px_rgba(16,185,129,0.08)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.01) 100%)',
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {/* Glowing background blob */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-green-500/10 blur-xl pointer-events-none" />

                    <div className="flex gap-4 items-start relative z-10">
                      {/* Integration status icon badge */}
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 text-green-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                          </div>
                          <span className="text-[12px] font-extrabold tracking-wider text-green-400 uppercase">
                            App Installed & Linked
                          </span>
                        </div>
                        <p className="text-[11.5px] text-white/60 leading-relaxed font-normal">
                          Your workspace is connected to our GitHub App background integration. Commits and branches pushed to active repositories will trigger automatic workspace sync schedules.
                        </p>
                      </div>
                    </div>

                    {githubAppStatus.installUrl && (
                      <div className="mt-4 pt-3 border-t border-green-500/10 flex justify-end relative z-10">
                        <a
                          href={githubAppStatus.installUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-400 transition-all hover:text-green-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <span>Configure Repository Access on GitHub</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                ) : githubAppStatus?.githubAppConfigured && !githubAppStatus.installationLinked ? (
                  <div 
                    className="p-5 rounded-xl border relative overflow-hidden transition-all duration-300 hover:shadow-[0_4px_30px_rgba(207,254,38,0.06)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(207,254,38,0.05) 0%, rgba(207,254,38,0.01) 100%)',
                      borderColor: 'rgba(207, 254, 38, 0.2)',
                    }}
                  >
                    {/* Glowing background blob */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#CFFE26]/10 blur-xl pointer-events-none" />

                    <div className="flex gap-4 items-start relative z-10">
                      {/* Pending setup icon badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#CFFE26]/10 border border-[#CFFE26]/20 flex items-center justify-center shrink-0 text-[#CFFE26] shadow-[0_0_15px_rgba(207,254,38,0.1)]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CFFE26] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CFFE26]"></span>
                          </div>
                          <span className="text-[12px] font-extrabold tracking-wider text-[#CFFE26] uppercase">
                            Awaiting App Setup
                          </span>
                        </div>
                        <p className="text-[11.5px] text-white/60 leading-relaxed font-normal">
                          To activate push-triggered auto-updates, finalize the installation of the Routiq App on your repository or organization.
                        </p>
                      </div>
                    </div>

                    {githubAppStatus.installUrl && (
                      <div className="mt-4 pt-3 border-t border-[#CFFE26]/10 flex justify-end relative z-10">
                        <a
                          href={githubAppStatus.installUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold text-black transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_15px_rgba(207,254,38,0.25)]"
                          style={{ background: '#CFFE26' }}
                        >
                          <span>Install Routiq GitHub App</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Push auto-sync triggers are not active in this workspace. Direct manual repository scanner import is fully active and supported above.
                    </p>
                  </div>
                )}
              </div>

              {/* Information Cards */}
              <div className="border rounded-2xl p-6 space-y-3" style={{ background: '#1A1A1A', borderColor: '#262626' }}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                  How Imports Work
                </h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Routiq runs deep background static scanners to detect code router setups, OpenAPI JSON/YAML specifications, and request directories inside your linked repository branch.
                </p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Imports are scheduled as cloud jobs. Once complete, a detailed analysis log is compiled and synced into a collection. You will receive an email confirmation containing the scan results.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PORTAL NOTICE MODAL */}
      {scanNotice && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="github-scan-notice-title"
          onClick={() => setScanNotice(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all"
            style={{ background: '#1A1A1A', borderColor: '#2E2E2E' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                color:
                  scanNotice.tone === 'success'
                    ? '#10B981'
                    : scanNotice.tone === 'error'
                      ? '#EF4444'
                      : '#61AFFE',
              }}
            >
              GitHub Scan Queue
            </p>
            <h3 id="github-scan-notice-title" className="text-lg font-bold text-white">
              {scanNotice.title}
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-white/60">
              {scanNotice.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setScanNotice(null)}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all hover:bg-white/5"
                style={{ borderColor: '#2E2E2E', color: '#FFF' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
