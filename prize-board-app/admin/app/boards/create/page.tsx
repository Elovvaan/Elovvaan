'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';

export default function CreateBoardPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', pricePerEntry: '', maxEntries: '' });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/admin/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pricePerEntry: Number(form.pricePerEntry),
        maxEntries: Number(form.maxEntries)
      })
    });
    router.push('/boards');
  }

  return (
    <Layout>
      <main className="space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create Board</h1>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Title<input className="mt-1 w-full rounded border p-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label className="text-sm">Description<input className="mt-1 w-full rounded border p-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="text-sm">Price Per Entry<input className="mt-1 w-full rounded border p-2" type="number" value={form.pricePerEntry} onChange={(e) => setForm({ ...form, pricePerEntry: e.target.value })} /></label>
          <label className="text-sm">Max Entries<input className="mt-1 w-full rounded border p-2" type="number" value={form.maxEntries} onChange={(e) => setForm({ ...form, maxEntries: e.target.value })} /></label>
          <button className="rounded bg-indigo-600 px-4 py-2 text-white md:col-span-2" type="submit">Save board</button>
        </form>
      </main>
    </Layout>
  );
}
