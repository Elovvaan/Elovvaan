'use client';

import { AdminNav } from '@/components/nav';
import { adminAuth } from '@/lib/auth';
import { adminFetch } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BoardEntriesPage() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<Array<{ id: string; user: { email: string }; boardCell: { cellNumber: number } }>>([]);
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    const token = adminAuth.get();
    if (!token) return;
    adminFetch(`/admin/boards/${id}/entries`, token).then(setEntries);
  }, [id]);

  async function updateStatus() {
    const token = adminAuth.get();
    if (!token) return;
    await adminFetch(`/admin/boards/${id}`, token, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  return <div><AdminNav /><h1 className="mb-3 text-2xl font-semibold">Board Entries</h1><div className="mb-4 flex gap-2"><select className="rounded border p-2" value={status} onChange={(e)=>setStatus(e.target.value)}><option>DRAFT</option><option>ACTIVE</option><option>CLOSED</option></select><button onClick={updateStatus} className="rounded bg-blue-600 px-4 py-2 text-white">Update Status</button></div><div className="space-y-2">{entries.map((entry)=><div key={entry.id} className="rounded border p-3">{entry.user.email} claimed cell #{entry.boardCell.cellNumber}</div>)}</div></div>;
}
