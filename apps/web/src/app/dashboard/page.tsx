'use client';

import { Nav } from '@/components/nav';
import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [me, setMe] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;
    apiFetch('/auth/me', {}, token).then(setMe).catch(() => setMe(null));
  }, []);

  return <div><Nav /><h1 className="mb-3 text-2xl font-semibold">Dashboard</h1>{me ? <p>Welcome {me.email} ({me.role})</p> : <p>Please login.</p>}</div>;
}
