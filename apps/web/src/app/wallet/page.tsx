'use client';

import { useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;

    fetch(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWallet(data));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        {!wallet && <p className="text-sm text-slate-400">Log in to load wallet data.</p>}
        {wallet && (
          <>
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-3xl font-bold">${wallet.balance}</p>
            <p className="mt-2 text-xs text-slate-500">Credit balance: ${wallet.creditBalance}</p>
          </>
        )}
      </section>
    </div>
  );
}
