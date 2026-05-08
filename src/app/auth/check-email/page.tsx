'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const mailNotSent = searchParams.get('mail') === '0';
  const raw = searchParams.get('email') ?? '';
  const initialEmail =
    raw === ''
      ? ''
      : (() => {
          try {
            return decodeURIComponent(raw);
          } catch {
            return raw;
          }
        })();
  const [inputEmail, setInputEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'err'>('idle');
  const [err, setErr] = useState('');

  const resend = async () => {
    const target = inputEmail.trim();
    if (!target) {
      setErr('Enter the email you used to sign up.');
      return;
    }
    setStatus('sending');
    setErr('');
    try {
      await api.post('/auth/resend-verification', { email: target });
      setStatus('sent');
    } catch (e: unknown) {
      setStatus('err');
      setErr(e instanceof Error ? e.message : 'Could not send email');
    }
  };

  return (
    <div className="w-full max-w-md reveal">
      <div className="mb-10 text-center">
        <h1
          className="display-title mb-3 text-white"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
        >
          Check your email
        </h1>
        <p className="font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
          We sent a verification link
          {inputEmail ? (
            <>
              {' '}
              to <span className="text-white/90 font-mono text-[13px]">{inputEmail}</span>
            </>
          ) : (
            ' to your inbox'
          )}
          . Open it and tap <strong className="text-white/80">Verify email address</strong> to activate your account.
        </p>
      </div>

      <div className="premium-card relative overflow-hidden">
        <div className="scanline" />
        <div className="relative z-10 space-y-5 text-center">
          {mailNotSent && (
            <div
              className="p-3 rounded-lg text-left text-[12px] leading-relaxed border"
              style={{
                background: 'rgba(207,254,38,0.06)',
                borderColor: 'rgba(207,254,38,0.25)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              We could not send email from the server (check <span className="font-mono">RESEND_API_KEY</span> in the
              API <span className="font-mono">.env</span>). You can still use &quot;Resend&quot; once mail is configured,
              or ask an admin to verify your row in the database.
            </div>
          )}
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Didn&apos;t get it? Check spam, then resend. Links expire after 48 hours.
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
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
              Email for resend
            </label>
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={resend}
            disabled={status === 'sending'}
            className={`btn-premium w-full justify-center ${status === 'sending' ? 'opacity-60 cursor-wait' : ''}`}
          >
            {status === 'sending' ? 'Sending…' : 'Resend verification email'}
          </button>
          <p className="text-sm text-white/40 pt-2">
            <Link href="/auth/login" className="text-white font-black hover:text-accent transition-colors">
              Back to sign in
            </Link>
            {' · '}
            <Link href="/auth/register" className="text-white font-black hover:text-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <AuthChrome footer="ROUTIQ EMAIL VERIFICATION">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center text-white/50 text-sm">Loading…</div>
        }
      >
        <CheckEmailContent />
      </Suspense>
    </AuthChrome>
  );
}
