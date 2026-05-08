'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, selectIsAuthed } from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { AuthRouteLoading } from '@/components/auth/AuthRouteLoading';

const CLI_DEVICE_PATH = '/auth/cli-device';

/** Logged-in but unverified users may stay on these routes until they verify. */
const UNVERIFIED_AUTH_PATH_PREFIXES = [
  '/auth/verify-required',
  '/auth/check-email',
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/forgot-password',
  CLI_DEVICE_PATH,
] as const;

function isAllowedForUnverifiedAuthedUser(pathname: string): boolean {
  return UNVERIFIED_AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * - Guests: see login/register/etc.
 * - Verified session: leave all /auth routes for the dashboard.
 * - Unverified session: only specific /auth routes; anything else (e.g. login) → verify-required.
 */
export default function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const hydrated = useAuthHydrated();
  const isAuthed = useAuthStore(selectIsAuthed);
  const emailVerified = useAuthStore((s) => s.user?.emailVerified === true);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed) return;
    if (emailVerified) {
      if (pathname === CLI_DEVICE_PATH) return;
      router.replace('/dashboard');
      return;
    }
    if (!isAllowedForUnverifiedAuthedUser(pathname)) {
      router.replace('/auth/verify-required');
    }
  }, [hydrated, isAuthed, emailVerified, pathname, router]);

  if (!hydrated) {
    return <AuthRouteLoading />;
  }

  if (isAuthed && emailVerified && pathname !== CLI_DEVICE_PATH) {
    return <AuthRouteLoading />;
  }

  if (isAuthed && !emailVerified && !isAllowedForUnverifiedAuthedUser(pathname)) {
    return <AuthRouteLoading />;
  }

  return <>{children}</>;
}
