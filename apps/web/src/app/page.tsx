'use client';

import { SwipeCard } from '@/components/swipe-card';
import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useEffect, useMemo, useState } from 'react';

type FeedItem = {
  type: 'BOARD' | 'CHALLENGE';
  score: number;
  item: {
    id: string;
    title: string;
    description?: string | null;
    entryFee?: number | string;
    prizePool?: number | string;
    category?: { id: string; name: string };
    recScore?: number;
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
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">Ranked Swipe Feed</span>
        </div>
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Search boards, arenas, challenges" />
      </header>

      {error ? <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">{error}</p> : null}

      {rankedFeed.map((feedItem) => (
        <SwipeCard
          key={`${feedItem.type}-${feedItem.item.id}`}
          cta={feedItem.type === 'BOARD' ? 'Prize Board' : 'VS Challenge'}
          title={feedItem.item.title}
          subtitle={`${feedItem.item.category?.name ?? 'General'} • $${Number(feedItem.item.entryFee ?? 0).toFixed(2)} entry • $${Number(feedItem.item.prizePool ?? 0).toFixed(2)} pool`}
          score={feedItem.score}
          onAction={(action) => trackAction(feedItem, action)}
        />
      ))}
    </div>
  );
}
