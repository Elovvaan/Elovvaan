'use client';

import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = await apiFetch<{ accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.set(data.accessToken);
    router.push('/dashboard');
  }

  return <form onSubmit={submit} className="space-y-3"><h1 className="text-2xl font-semibold">Register</h1><input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="w-full rounded border p-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="rounded bg-blue-600 px-4 py-2 text-white">Create Account</button></form>;
}
