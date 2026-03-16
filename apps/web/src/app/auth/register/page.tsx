'use client';

import { FormEvent, useState } from 'react';
import { authStorage } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function RegisterPage() {
  const [username, setUsername] = useState('newplayer');
  const [email, setEmail] = useState('newplayer@swipe2win.app');
  const [password, setPassword] = useState('Passw0rd!');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      setMessage(await response.text());
      return;
    }

    const data = await response.json();
    authStorage.set(data.accessToken);
    setMessage('Account created. Token saved locally.');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h1 className="text-xl font-semibold">Register</h1>
      <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Username" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Password" type="password" />
      <button className="w-full rounded-xl bg-cyan-600 py-2">Create account</button>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </form>
  );
}
