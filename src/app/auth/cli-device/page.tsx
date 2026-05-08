'use client';

import { Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore, selectIsAuthed } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { AuthChrome } from '@/components/auth/AuthChrome';

function CliDeviceInner() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get('user_code')?.trim() ?? '';
  const hydrated = useAuthHydrated();
  const isAuthed = useAuthStore(selectIsAuthed);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const authorize = useCallback(async () => {
    setErr(null);
    setMsg(null);
    if (!rawCode) {
      setErr('Missing user code. Open the link from your terminal again.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/cli/approve', { user_code: rawCode });
      setMsg('CLI authorized. You can return to your terminal and close this tab.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Authorization failed');
    } finally {
      setBusy(false);
    }
  }, [rawCode]);

  if (!hydrated) {
    return (
      <AuthChrome title="Connect CLI" subtitle="Loading…">
        <p className="text-sm text-white/40">Loading…</p>
      </AuthChrome>
    );
  }

  if (!isAuthed) {
    const next = `/auth/cli-device?user_code=${encodeURIComponent(rawCode)}`;
    return (
      <AuthChrome
        title="Connect CLI"
        subtitle="Sign in to authorize the Rauts CLI on this computer."
      >
        <p className="text-sm text-white/50 mb-6">
          After you sign in, you will approve access for code:{' '}
          <span className="font-mono text-white/80">{rawCode || '—'}</span>
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="block w-full text-center py-3 rounded-lg text-sm font-semibold text-black"
            style={{ background: '#CFFE26' }}
          >
            Sign in
          </Link>
          <Link href="/auth/register" className="text-center text-sm text-white/45 hover:text-white/70">
            Create an account
          </Link>
        </div>
      </AuthChrome>
    );
  }

  return (
    <AuthChrome
      title="Authorize CLI"
      subtitle="Confirm that you started login from the Rauts CLI on your machine."
    >
      <div className="space-y-4">
        <p className="text-sm text-white/55">
          User code:{' '}
          <span className="font-mono tracking-wide text-[15px]" style={{ color: '#CFFE26' }}>
            {rawCode || '—'}
          </span>
        </p>
        {msg && <p className="text-sm" style={{ color: '#CFFE26' }}>{msg}</p>}
        {err && <p className="text-sm text-red-400/90">{err}</p>}
        {!msg && (
          <button
            type="button"
            disabled={busy || !rawCode}
            onClick={() => void authorize()}
            className="w-full py-3 rounded-lg text-sm font-semibold text-black disabled:opacity-50"
            style={{ background: '#CFFE26' }}
          >
            {busy ? 'Authorizing…' : 'Authorize CLI'}
          </button>
        )}
        <Link href="/dashboard" className="block text-center text-sm text-white/40 hover:text-white/65">
          Back to dashboard
        </Link>
      </div>
    </AuthChrome>
  );
}

export default function CliDevicePage() {
  return (
    <Suspense
      fallback={
        <AuthChrome title="Connect CLI" subtitle="Loading…">
          <p className="text-sm text-white/40">Loading…</p>
        </AuthChrome>
      }
    >
      <CliDeviceInner />
    </Suspense>
  );
}
