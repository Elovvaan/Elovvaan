'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Login failed');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button className="w-full rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Login</button>
      </form>
    </div>
  );
}
