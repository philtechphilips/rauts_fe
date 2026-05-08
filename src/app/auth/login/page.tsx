'use client';

import { Suspense } from 'react';
import { AuthChrome } from '@/components/auth/AuthChrome';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthChrome>
          <p className="text-center text-sm text-white/40">Loading…</p>
        </AuthChrome>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
