'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Entry, Winner } from '@/services/types';

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);

  useEffect(() => {
    fetch(`/api/admin/boards/${params.id}/entries`).then((res) => res.json()).then(setEntries);
    fetch(`/api/admin/boards/${params.id}/winner`).then((res) => (res.ok ? res.json() : null)).then(setWinner);
  }, [params.id]);

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold">Board {params.id}</h1>
      <section className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Winner</h2>
        {winner ? (
          <p className="text-sm">Board: {winner.boardId} • User: {winner.userId} • Entry: {winner.entryId} • {new Date(winner.createdAt).toLocaleString()}</p>
        ) : (
          <p className="text-sm text-slate-500">No winner selected yet.</p>
        )}
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Entries</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Entry ID</th><th className="p-2">User ID</th><th className="p-2">Payment ID</th><th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b">
                <td className="p-2">{entry.id}</td>
                <td className="p-2">{entry.userId}</td>
                <td className="p-2">{entry.paymentId}</td>
                <td className="p-2">{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
