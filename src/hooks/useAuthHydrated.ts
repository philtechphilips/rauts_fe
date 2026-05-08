'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/authStore';

/** True after zustand `persist` has rehydrated from localStorage (client only). */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (useAuthStore.persist.hasHydrated()) {
        queueMicrotask(onChange);
        return () => {};
      }
      return useAuthStore.persist.onFinishHydration(onChange);
    },
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
