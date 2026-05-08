import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  name: string | null;
  emailVerified?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

/** Session present (JWT in store). User may still need email verification for dashboard. */
export const selectIsAuthed = (s: AuthState) => Boolean(s.token && s.isLoggedIn);

/** Dashboard and other verified-only areas. */
export const selectCanAccessDashboard = (s: AuthState) =>
  Boolean(s.token && s.isLoggedIn && s.user?.emailVerified === true);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      setAuth: (token, user) => set({ token, user, isLoggedIn: true }),
      updateUser: (partial) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...partial } : null,
        })),
      logout: () => set({ token: null, user: null, isLoggedIn: false }),
    }),
    {
      name: 'routiq-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
