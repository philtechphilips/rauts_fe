'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { RautsLogo } from '@/components/common/Logo';
import { profileDisplayName } from '@/lib/userDisplay';
import { api } from '@/lib/api';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';

type MeResponse = {
  success?: boolean;
  user: {
    id: number;
    email: string;
    name: string | null;
    emailVerified: boolean;
  };
};

type User = NonNullable<ReturnType<typeof useAuthStore.getState>['user']>;

function ProfileForm({
  user,
  logout,
  updateUser,
}: {
  user: User;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}) {
  const [name, setName] = useState(() => user.name?.trim() ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      const res = (await api.patch('/auth/me', { name: name.trim() })) as MeResponse;
      if (res.user) updateUser(res.user);
      setName(res.user.name?.trim() ?? '');
      setOk('Profile saved.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="premium-card space-y-5">
      <div>
        <label
          htmlFor="profile-name"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 block"
        >
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={128}
          className="w-full mt-1 px-3 py-2 rounded border text-[15px] outline-none select-text"
          style={{
            background: '#1A1A1A',
            borderColor: '#3A3A3A',
            color: 'rgba(255,255,255,0.85)',
          }}
          placeholder="Your name"
        />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Email</p>
        <p className="text-[15px] font-mono" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {user.email}
        </p>
        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Email cannot be changed here. Use support if you need to move your account.
        </p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Email status</p>
        <p
          className="text-[13px] font-semibold"
          style={{ color: user.emailVerified ? '#CFFE26' : 'rgba(255,255,255,0.45)' }}
        >
          {user.emailVerified ? 'Verified' : 'Not verified'}
        </p>
      </div>

      {err && (
        <p className="text-[12px]" style={{ color: 'rgba(249,62,62,0.85)' }}>
          {err}
        </p>
      )}
      {ok && (
        <p className="text-[12px]" style={{ color: '#CFFE26' }}>
          {ok}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded text-[12px] font-semibold text-black transition-opacity disabled:opacity-50"
          style={{ background: '#CFFE26' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="px-4 py-2 rounded text-[12px] font-semibold transition-colors hover:bg-red-400/10"
          style={{ color: 'rgba(249,62,62,0.75)' }}
        >
          Log out
        </button>
      </div>
    </form>
  );
}

export default function DashboardProfilePage() {
  const hydrated = useAuthHydrated();
  const { user, logout, updateUser } = useAuthStore();
  const nameDisplay = profileDisplayName(user);

  return (
    <div
      className="min-h-full flex flex-col text-white"
      style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <header
        className="shrink-0 border-b px-4 h-12 flex items-center gap-3"
        style={{ background: '#2C2C2C', borderColor: '#3A3A3A' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <RautsLogo className="w-5 h-5 opacity-90 group-hover:opacity-100" />
          <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Back to workspace
          </span>
        </Link>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-semibold mb-2" style={{ color: '#fff' }}>
            Profile
          </h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Signed in as {nameDisplay}
          </p>

          {!hydrated && (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Loading…
            </p>
          )}
          {hydrated && user && (
            <ProfileForm key={user.id} user={user} logout={logout} updateUser={updateUser} />
          )}
        </div>
      </main>
    </div>
  );
}
