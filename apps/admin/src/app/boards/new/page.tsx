'use client';

import { AdminNav } from '@/components/nav';
import { adminAuth } from '@/lib/auth';
import { adminFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewBoardPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [totalCells, setTotalCells] = useState(25);
  const [pricePerEntry, setPricePerEntry] = useState(5);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const token = adminAuth.get();
    if (!token) return;
    await adminFetch('/admin/boards', token, { method: 'POST', body: JSON.stringify({ title, slug, totalCells, pricePerEntry, status: 'DRAFT' }) });
    router.push('/boards');
  }

  return <div><AdminNav /><form onSubmit={submit} className="space-y-3"><h1 className="text-2xl font-semibold">Create Board</h1><input className="w-full rounded border p-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} /><input className="w-full rounded border p-2" placeholder="Slug" value={slug} onChange={(e)=>setSlug(e.target.value)} /><input className="w-full rounded border p-2" type="number" value={totalCells} onChange={(e)=>setTotalCells(Number(e.target.value))} /><input className="w-full rounded border p-2" type="number" value={pricePerEntry} onChange={(e)=>setPricePerEntry(Number(e.target.value))} /><button className="rounded bg-blue-600 px-4 py-2 text-white">Create</button></form></div>;
}
