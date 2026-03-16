'use client';

import { AdminNav } from '@/components/nav';
import { adminAuth } from '@/lib/auth';
import { adminFetch } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminBoardsPage() {
  const [boards, setBoards] = useState<Array<{ id: string; title: string; status: string }>>([]);

  useEffect(() => {
    const token = adminAuth.get();
    if (!token) return;
    adminFetch('/admin/boards', token).then(setBoards);
  }, []);

  return <div><AdminNav /><h1 className="mb-4 text-2xl font-semibold">Boards</h1><div className="space-y-2">{boards.map((board)=> <Link key={board.id} href={`/boards/${board.id}`} className="block rounded border p-3">{board.title} ({board.status})</Link>)}</div></div>;
}
