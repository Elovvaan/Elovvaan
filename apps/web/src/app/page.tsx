'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { coerceHomeRecommendations, FeedItem } from '@/lib/recommendations';

export default function HomePage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) {
      setError('Login required to load personalized recommendations.');
      setLoading(false);
      return;
    }

    apiFetch<unknown>('/recommendations/home', {}, token)
      .then((data) => {
        const coerced = coerceHomeRecommendations(data);
        const droppedCount = Array.isArray((data as { feed?: unknown[] })?.feed)
          ? (data as { feed: unknown[] }).feed.length - coerced.feed.length
          : 0;

        if (droppedCount > 0) {
          console.warn(`[recommendations] Dropped ${droppedCount} malformed feed item(s).`);
        }

        setFeed(coerced.feed);
      })
      .catch((err) => {
        console.error('[recommendations] Failed to load home feed', err);
        setError(String(err?.message ?? err));
      })
      .finally(() => setLoading(false));
  }, []);

  async function trackAction(feedItem: FeedItem, action: 'SWIPE_LEFT' | 'JOIN' | 'SAVE' | 'SHARE') {
    const token = authStorage.get();
    if (!token) return;

    setEventError(null);

    try {
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
      );
    } catch (err) {
      console.error('[recommendations] Failed to post behavior event', err);
      setEventError('Unable to log your action right now. Please retry.');
      return;
    }

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
      {eventError ? <p className="text-sm text-amber-400">{eventError}</p> : null}

      {loading ? <p className="text-sm text-slate-400">Loading recommendations…</p> : null}

      {!loading && !error && rankedFeed.length === 0 ? (
        <p className="text-sm text-slate-400">No recommendations yet. Try joining a board or challenge to improve your feed.</p>
      ) : null}

      {rankedFeed.length > 0 ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold">Recommended for you</h2>
          <div className="mt-3 space-y-2">
            {rankedFeed.slice(0, 6).map((feedItem) => (
              <div key={`${feedItem.type}-${feedItem.item.id}`} className="rounded-xl border border-slate-700 p-3">
                <p className="text-sm font-medium">{feedItem.item.title ?? feedItem.item.name ?? 'Untitled recommendation'}</p>
                <p className="text-xs text-slate-400">{feedItem.type} • score {feedItem.score.toFixed(2)}</p>
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
