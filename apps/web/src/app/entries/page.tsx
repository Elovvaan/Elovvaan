'use client';

import { Nav } from '@/components/nav';
import { apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function EntriesPage() {
  const [entries, setEntries] = useState<Array<{ id: string; board: { title: string }; boardCell: { cellNumber: number } }>>([]);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;
    apiFetch('/users/me/entries', {}, token).then(setEntries);
  }, []);

  return <div><Nav /><h1 className="mb-4 text-2xl font-semibold">My Entries</h1><div className="space-y-2">{entries.map((entry)=><div key={entry.id} className="rounded border bg-white p-3">{entry.board.title} - Cell #{entry.boardCell.cellNumber}</div>)}</div></div>;
}
