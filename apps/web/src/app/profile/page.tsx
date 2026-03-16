'use client';

import { useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;

    fetch(`${API_URL}/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        {!profile && <p className="text-sm text-slate-400">Log in to load profile data.</p>}
        {profile && (
          <>
            <p className="font-semibold">@{profile.username}</p>
            <p className="mt-2 text-sm text-slate-400">Wins {profile.wins} • Losses {profile.losses} • Earnings ${profile.earnings}</p>
          </>
        )}
      </section>
    </div>
  );
}
