'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthChrome footer="ROUTIQ PASSWORD RECOVERY">
      <div className="w-full max-w-md reveal">
        <div className="mb-10 text-center">
          <h1
            className="display-title mb-3 text-white"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
          >
            Forgot password
          </h1>
          <p className="font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            Enter the email you use for Rauts. If we find a verified account, we&apos;ll send reset instructions.
          </p>
        </div>

        <div className="premium-card relative overflow-hidden group">
          <div className="scanline" />
          {done ? (
            <div className="relative z-10 space-y-4 text-center">
              <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                If an account exists for that email, we sent a link to reset your password. It expires in one hour.
              </p>
              <Link href="/auth/login" className="btn-premium inline-flex justify-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={submit}>
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`btn-premium w-full justify-center mt-2 group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending…' : 'Send reset link'}
                {!loading && <span className="inline-block transition-transform group-hover:translate-x-1">→</span>}
              </button>
              <p className="text-center text-sm text-white/40 pt-2">
                <Link href="/auth/login" className="text-white font-black hover:text-accent transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AuthChrome>
  );
}
