'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAuthStore,
  selectIsAuthed,
  selectCanAccessDashboard,
} from '@/store/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';
import { AuthRouteLoading } from '@/components/auth/AuthRouteLoading';

/**
 * Dashboard is only available with a verified email. Signed-in but unverified users go to verify-required.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const isAuthed = useAuthStore(selectIsAuthed);
  const canAccess = useAuthStore(selectCanAccessDashboard);

  useEffect(() => {
    if (!hydrated) return;
    if (canAccess) return;
    router.replace(isAuthed ? '/auth/verify-required' : '/auth/login');
  }, [hydrated, canAccess, isAuthed, router]);

  if (!hydrated || !canAccess) {
    return <AuthRouteLoading />;
  }

  return <>{children}</>;
}
