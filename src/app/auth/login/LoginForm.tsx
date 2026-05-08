'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const next = safeNextPath(searchParams.get('next'));

    try {
      const response = (await api.post('/auth/login', { email, password })) as {
        token: string;
        user: { id: number; email: string; name: string | null; emailVerified?: boolean };
      };
      setAuth(response.token, response.user);
      if (next) {
        router.push(next);
        return;
      }
      if (response.user.emailVerified) {
        router.push('/dashboard');
      } else {
        router.push('/auth/verify-required');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthChrome>
      <div className="w-full max-w-md reveal">
        <div className="mb-10">
          <h1
            className="display-title mb-3 text-center w-full text-white"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2 }}
          >
            Welcome back
          </h1>
          <p
            className="text-center w-full font-medium leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}
          >
            Continue scanning your API intelligence.
          </p>
        </div>

        <div className="premium-card relative overflow-hidden group">
          <div className="scanline" />

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 font-mono text-sm focus:border-accent/40 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block ml-1">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/50 hover:text-accent transition-colors"
                >
                  Forgot?
                </Link>
              </div>
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
              {isLoading ? 'Decrypting...' : 'Sign In'}
              {!isLoading && <span className="inline-block transition-transform group-hover:translate-x-1">→</span>}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-white font-black hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </AuthChrome>
  );
}
