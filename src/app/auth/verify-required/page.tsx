'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';
import { useAuthStore, selectIsAuthed } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { AuthRouteLoading } from '@/components/auth/AuthRouteLoading';

export default function VerifyRequiredPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const isAuthed = useAuthStore(selectIsAuthed);
  const emailVerified = useAuthStore((s) => s.user?.emailVerified === true);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'err'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) {
      router.replace('/auth/login');
      return;
    }
    if (emailVerified) {
      router.replace('/dashboard');
    }
  }, [hydrated, isAuthed, emailVerified, router]);

  const resend = async () => {
    const email = user?.email?.trim();
    if (!email) {
      setErr('No email on this session. Sign out and sign in again.');
      return;
    }
    setStatus('sending');
    setErr('');
    try {
      await api.post('/auth/resend-verification', { email });
      setStatus('sent');
    } catch (e: unknown) {
      setStatus('err');
      setErr(e instanceof Error ? e.message : 'Could not send email');
    }
  };

  if (!hydrated || !isAuthed || emailVerified) {
    return <AuthRouteLoading />;
  }

  return (
    <AuthChrome footer="ROUTIQ EMAIL VERIFICATION">
      <div className="w-full max-w-md reveal">
        <div className="mb-10 text-center">
          <h1
            className="display-title mb-3 text-white"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
          >
            Verify your email
          </h1>
          <p className="font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            You&apos;re signed in as{' '}
            <span className="text-white/90 font-mono text-[13px]">{user?.email}</span>. Confirm your address to open
            the dashboard. Check spam if you don&apos;t see the message.
          </p>
        </div>

        <div className="premium-card relative overflow-hidden">
          <div className="scanline" />
          <div className="relative z-10 space-y-5 text-center">
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Open the email from Rauts and tap <strong className="text-white/80">Verify email address</strong>, or
              use the link in that message.
            </p>
            {err && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                {err}
              </div>
            )}
            {status === 'sent' && (
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#CFFE26' }}>
                If we find an unverified account for that email, we&apos;ll send a new link. Check your inbox shortly.
              </p>
            )}
            <button
              type="button"
              onClick={resend}
              disabled={status === 'sending'}
              className={`btn-premium w-full justify-center ${status === 'sending' ? 'opacity-60 cursor-wait' : ''}`}
            >
              {status === 'sending' ? 'Sending…' : 'Resend verification email'}
            </button>
            <div className="flex justify-center pt-2 text-sm text-white/40">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/auth/login');
                }}
                className="text-white font-black hover:text-accent transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthChrome>
  );
}
