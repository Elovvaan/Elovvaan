'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BoardTable } from '@/components/BoardTable';
import { Layout } from '@/components/Layout';
import { Board } from '@/services/types';
import { useSocket } from '@/hooks/useSocket';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const feed = useSocket(['board_update', 'entry_added', 'board_full', 'winner_selected']);

  async function loadBoards() {
    const res = await fetch('/api/admin/boards');
    const data = await res.json();
    setBoards(data);
  }

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (feed.length) {
      loadBoards();
    }
  }, [feed.length]);

  async function closeBoard(id: string) {
    await fetch(`/api/admin/boards/${id}/close`, { method: 'PATCH' });
    await loadBoards();
  }

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Boards</h1>
        <Link href="/boards/create" className="rounded bg-indigo-600 px-4 py-2 text-white">Create Board</Link>
      </div>
      <BoardTable boards={boards} onClose={closeBoard} />
    </Layout>
  );
}
