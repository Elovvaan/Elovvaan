'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Winner } from '@/services/types';

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    fetch('/api/admin/winners').then((res) => res.json()).then(setWinners);
  }, []);

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold">Winners</h1>
      <div className="rounded-lg bg-white p-4 shadow">
        <ul className="space-y-2">
          {winners.map((winner) => (
            <li key={winner.id} className="rounded border p-3 text-sm">
              Board: {winner.boardId} • Winner User: {winner.userId} • Winning Entry: {winner.entryId} • {new Date(winner.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
