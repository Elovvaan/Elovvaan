'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { MetricCard } from '@/components/MetricCard';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const feed = useSocket(['board_update', 'entry_added', 'board_full', 'winner_selected']);

  useEffect(() => {
    fetch('/api/admin/metrics').then((res) => res.json()).then(setMetrics);
  }, []);

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Users" value={metrics?.totalUsers ?? 0} />
        <MetricCard label="Total Boards" value={metrics?.totalBoards ?? 0} />
        <MetricCard label="Active Boards" value={metrics?.activeBoards ?? 0} />
        <MetricCard label="Total Entries" value={metrics?.totalEntries ?? 0} />
        <MetricCard label="Total Payments" value={metrics?.totalPayments ?? 0} />
        <MetricCard label="Total Winners" value={metrics?.totalWinners ?? 0} />
      </section>

      <section className="mt-6 rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Real-time Events</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {feed.map((item, index) => (
            <li key={`${item.at}-${index}`} className="rounded border border-slate-200 p-2">
              <span className="mr-2 rounded bg-indigo-100 px-2 py-0.5 text-indigo-700">{item.event}</span>
              <span className="text-slate-600">{JSON.stringify(item.payload)}</span>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
