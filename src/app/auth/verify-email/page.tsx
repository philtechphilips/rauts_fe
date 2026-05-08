'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!token.trim()) {
      setError('This page is missing a verification token. Open the link from your email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = (await api.post('/auth/verify-email', { token })) as {
        token: string;
        user: { id: number; email: string; name: string | null; emailVerified?: boolean };
      };
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
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
          Confirm your email
        </h1>
        <p className="font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          One step left. Confirm below to verify this device and sign in.
        </p>
      </div>

      <div className="premium-card relative overflow-hidden">
        <div className="scanline" />
        <div className="relative z-10 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={loading || !token}
            className={`btn-premium w-full justify-center group ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? 'Verifying…' : 'Verify email address'}
            {!loading && <span className="inline-block transition-transform group-hover:translate-x-1">→</span>}
          </button>
          <p className="text-center text-sm text-white/40">
            <Link href="/auth/check-email" className="text-white font-black hover:text-accent transition-colors">
              Need a new link?
            </Link>
            {' · '}
            <Link href="/auth/login" className="text-white font-black hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthChrome footer="ROUTIQ EMAIL VERIFICATION">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center text-white/50 text-sm">Loading…</div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </AuthChrome>
  );
}
