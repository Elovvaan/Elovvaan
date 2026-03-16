'use client';

import { adminAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@swipe2win.com');
  const [password, setPassword] = useState('ChangeMe123!');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    adminAuth.set(data.accessToken);
    router.push('/boards');
  }

  return <form onSubmit={submit} className="space-y-3"><h1 className="text-2xl font-semibold">Admin Login</h1><input className="w-full rounded border p-2" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="w-full rounded border p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="rounded bg-blue-600 px-4 py-2 text-white">Login</button></form>;
}
