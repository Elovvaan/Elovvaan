'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';

type FeedItem = {
  type: 'BOARD' | 'CHALLENGE';
  score: number;
  item: {
    id: string;
    title?: string;
    name?: string;
    category?: { id: string; name: string };
  };
};

export default function HomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) {
      setError('Login required to load personalized recommendations.');
      return;
    }

    apiFetch<{ feed: FeedItem[] }>('/recommendations/home', {}, token)
      .then((data) => setFeed(data.feed ?? []))
      .catch((err) => setError(String(err?.message ?? err)));
  }, []);

  async function trackAction(feedItem: FeedItem, action: 'SWIPE_LEFT' | 'JOIN' | 'SAVE' | 'SHARE') {
    const token = authStorage.get();
    if (!token) return;

    await apiFetch(
      '/recommendations/events',
      {
        method: 'POST',
        body: JSON.stringify({
          eventType: action === 'SHARE' ? 'VIEW' : action,
          itemType: feedItem.type,
          itemId: feedItem.item.id,
          metadata: { categoryId: feedItem.item.category?.id },
        }),
      },
      token,
    ).catch(() => undefined);

    if (action === 'SWIPE_LEFT') {
      setFeed((prev) => prev.filter((x) => x.item.id !== feedItem.item.id));
    }
  }

  const rankedFeed = useMemo(() => [...feed].sort((a, b) => b.score - a.score), [feed]);

  return (
    <div className="space-y-4">
      <header className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Swipe2Win</h1>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">Phase 1–2</span>
        </div>
        <p className="text-sm text-slate-400">Foundation rebuild complete: auth, profile, wallet, boards, and join flow.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Get started</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <Link href="/auth/register" className="rounded-xl border border-slate-700 px-3 py-2">
            Create account
          </Link>
          <Link href="/auth/login" className="rounded-xl border border-slate-700 px-3 py-2">
            Sign in
          </Link>
          <Link href="/boards" className="rounded-xl border border-slate-700 px-3 py-2">
            Browse boards
          </Link>
        </div>
      </section>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rankedFeed.length > 0 ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold">Recommended for you</h2>
          <div className="mt-3 space-y-2">
            {rankedFeed.slice(0, 6).map((feedItem) => (
              <div key={`${feedItem.type}-${feedItem.item.id}`} className="rounded-xl border border-slate-700 p-3">
                <p className="text-sm font-medium">{feedItem.item.title ?? feedItem.item.name ?? feedItem.item.id}</p>
                <p className="text-xs text-slate-400">{feedItem.type} • score {feedItem.score}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button className="rounded bg-slate-700 px-2 py-1" onClick={() => trackAction(feedItem, 'JOIN')}>Join</button>
                  <button className="rounded bg-slate-700 px-2 py-1" onClick={() => trackAction(feedItem, 'SAVE')}>Save</button>
                  <button className="rounded bg-slate-700 px-2 py-1" onClick={() => trackAction(feedItem, 'SWIPE_LEFT')}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
