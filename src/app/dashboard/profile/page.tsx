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
  const [copiedUid, setCopiedUid] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setSaving(true);
    try {
      const res = (await api.patch('/auth/me', { name: name.trim() })) as MeResponse;
      if (res.user) updateUser(res.user);
      setName(res.user.name?.trim() ?? '');
      setOk('Profile updated successfully.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const copyUid = () => {
    void navigator.clipboard?.writeText(String(user.id));
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Profile Settings form */}
      <form onSubmit={onSubmit} className="md:col-span-7 border rounded-2xl p-6 md:p-8 space-y-6" style={{ background: '#1A1A1A', borderColor: '#262626' }}>
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-white/40">
          Personal Information
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={128}
              className="w-full px-4 py-3 rounded-xl border text-[13px] outline-none transition-all focus:border-[#CFFE26]/40 focus:ring-1 focus:ring-[#CFFE26]/35"
              style={{
                background: '#141414',
                borderColor: '#2D2D2D',
                color: '#FFF',
              }}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-4 py-3 rounded-xl border text-[13px] outline-none opacity-40 select-text cursor-not-allowed"
              style={{
                background: '#141414',
                borderColor: '#2D2D2D',
                color: 'rgba(255,255,255,0.7)',
              }}
            />
            <p className="text-[11px] mt-2 text-white/25 leading-relaxed">
              Email addresses are linked to your sign-in identity and cannot be edited.
            </p>
          </div>
        </div>

        {err && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
            <strong>Error:</strong> {err}
          </div>
        )}
        {ok && (
          <div className="p-3.5 rounded-xl border border-[#CFFE26]/20 bg-[#CFFE26]/5 text-[#CFFE26] text-xs">
            {ok}
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-6 border-t border-[#262626]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
            style={{ background: '#CFFE26' }}
          >
            {saving ? 'Updating...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-red-500/10 hover:border-red-500/20 text-red-400"
            style={{ borderColor: '#2E2E2E' }}
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DashboardProfilePage() {
  const hydrated = useAuthHydrated();
  const { user, logout, updateUser } = useAuthStore();
  const nameDisplay = profileDisplayName(user);

  return (
    <div
      className="h-screen w-screen flex flex-col text-white selection:bg-[#CFFE26] selection:text-black overflow-hidden font-sans"
      style={{ background: '#141414' }}
    >
      {/* Unified workspace header */}
      <header
        className="shrink-0 border-b px-6 sm:px-8 h-16 flex items-center justify-between"
        style={{ background: '#1A1A1A', borderColor: '#262626' }}
      >
        <div className="flex items-center gap-3">
          <RautsLogo className="w-5.5 h-5.5" />
          <span className="text-[13px] font-extrabold uppercase tracking-widest text-white mt-0.5">Routiq</span>
        </div>

        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#2E2E2E] text-[11px] font-bold transition-all hover:bg-white/5 active:scale-95"
        >
          <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Workspace</span>
        </Link>
      </header>

      {/* Main Container Form View */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Segment */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#CFFE26]/10 border border-[#CFFE26]/20 flex items-center justify-center font-bold text-lg text-[#CFFE26] shadow-[0_0_15px_rgba(207,254,38,0.1)] shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Developer Profile Settings
              </h1>
              <p className="text-xs sm:text-sm text-white/40 mt-1">
                Manage your profile details and monitor sync connections for <span className="text-white font-semibold">{nameDisplay}</span>.
              </p>
            </div>
          </div>

          {!hydrated && (
            <div className="py-12 flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-[#CFFE26]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Syncing credentials...</span>
            </div>
          )}

          {hydrated && user && (
            <ProfileForm key={user.id} user={user} logout={logout} updateUser={updateUser} />
          )}

        </div>
      </main>
    </div>
  );
}
