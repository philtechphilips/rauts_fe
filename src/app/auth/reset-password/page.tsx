'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { setAuth } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token.trim()) {
      setError('Missing reset token. Open the link from your email.');
      return;
    }
    setLoading(true);
    try {
      const res = (await api.post('/auth/reset-password', { token, password })) as {
        token: string;
        user: { id: number; email: string; name: string | null; emailVerified?: boolean };
      };
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md reveal">
      <div className="mb-10 text-center">
        <h1
          className="display-title mb-3 text-white"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
        >
          Set new password
        </h1>
        <p className="font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          Choose a strong password you haven&apos;t used elsewhere.
        </p>
      </div>

      <div className="premium-card relative overflow-hidden group">
        <div className="scanline" />
        <form className="space-y-6 relative z-10" onSubmit={submit}>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`btn-premium w-full justify-center mt-2 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving…' : 'Update password'}
            {!loading && <span className="inline-block transition-transform group-hover:translate-x-1">→</span>}
          </button>
          <p className="text-center text-sm text-white/40">
            <Link href="/auth/login" className="text-white font-black hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthChrome footer="ROUTIQ PASSWORD RECOVERY">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center text-white/50 text-sm">Loading…</div>
        }
      >
        <ResetPasswordInner />
      </Suspense>
    </AuthChrome>
  );
}
