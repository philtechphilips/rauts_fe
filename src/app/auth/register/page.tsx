'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = (await api.post('/auth/register', { name, email, password })) as {
        emailSent?: boolean;
      };
      const q = new URLSearchParams({ email: email.trim() });
      if (response.emailSent === false) {
        q.set('mail', '0');
      }
      router.push(`/auth/check-email?${q.toString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthChrome footer="ROUTIQ ACCOUNT // NEW WORKSPACE">
      <div className="w-full max-w-md reveal">
        <div className="mb-10">
          <h1
            className="display-title mb-3 text-center w-full text-white"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
          >
            Create account
          </h1>
          <p
            className="text-center w-full font-medium leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}
          >
            Map your APIs in one workspace — same intelligence as the CLI.
          </p>
        </div>

        <div className="premium-card relative overflow-hidden group">
          <div className="scanline" />

          <form className="space-y-6 relative z-10" onSubmit={handleRegister}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                required
                className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                required
                className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-premium w-full justify-center mt-8 group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
              {!isLoading && <span className="inline-block transition-transform group-hover:translate-x-1">→</span>}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-black hover:text-accent transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthChrome>
  );
}
