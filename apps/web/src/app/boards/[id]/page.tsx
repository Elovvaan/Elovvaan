'use client';

import { BoardGrid } from '@/components/board-grid';
import { Nav } from '@/components/nav';
import { Board, apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BoardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [selected, setSelected] = useState<number>();

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;
    apiFetch<Board>(`/boards/${id}`, {}, token).then(setBoard);
  }, [id]);

  async function claim() {
    const token = authStorage.get();
    if (!token || !selected) return;
    await apiFetch(`/boards/${id}/claim`, { method: 'POST', body: JSON.stringify({ cellNumber: selected }) }, token);
    const refreshed = await apiFetch<Board>(`/boards/${id}`, {}, token);
    setBoard(refreshed);
  }

  if (!board) return <p>Loading...</p>;

  return <div className="space-y-4"><Nav /><h1 className="text-2xl font-semibold">{board.title}</h1><p>Status: {board.status} | Price: ${board.pricePerEntry}</p><p>{board.filledCells}/{board.totalCells} claimed</p><BoardGrid cells={board.cells ?? []} selected={selected} onSelect={setSelected} /><button onClick={claim} className="rounded bg-blue-600 px-4 py-2 text-white">Claim selected cell</button></div>;
}
