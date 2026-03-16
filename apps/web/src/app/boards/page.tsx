'use client';

import { Nav } from '@/components/nav';
import { Board, apiFetch } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const token = authStorage.get();
    if (!token) return;
    apiFetch<Board[]>('/boards', {}, token).then(setBoards);
  }, []);

  return <div><Nav /><h1 className="mb-3 text-2xl font-semibold">Boards</h1><div className="space-y-2">{boards.map((board)=> <Link key={board.id} href={`/boards/${board.id}`} className="block rounded border bg-white p-4">{board.title} - {board.filledCells}/{board.totalCells}</Link>)}</div></div>;
}
