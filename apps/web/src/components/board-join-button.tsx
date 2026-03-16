'use client';

import { useState } from 'react';
import { authStorage } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function BoardJoinButton({ boardId }: { boardId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onJoin() {
    const token = authStorage.get();
    if (!token) {
      setMessage('Please log in first.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/boards/${boardId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Unable to join board');
      }

      setMessage('Joined successfully. Your wallet and board slot were updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to join board');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button disabled={isLoading} onClick={onJoin} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold disabled:opacity-60">
        {isLoading ? 'Joining...' : 'Join Board'}
      </button>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
