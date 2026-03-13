import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const AdminBoardListPage = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  useEffect(() => {
    boardService.listBoards().then(setBoards).catch(() => setBoards([]));
  }, []);

  return (
    <PageShell title="Admin Boards" subtitle="Create and monitor boards">
      <Link className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to="/admin/boards/create">Create Board</Link>
      <div className="grid gap-3 sm:grid-cols-2">
        {boards.map((board) => (
          <Card key={board.id}>
            <h3 className="font-semibold">{board.title}</h3>
            <Link className="text-sm text-brand-700" to={`/admin/boards/${board.id}`}>Details</Link>
          </Card>
        ))}
      </div>
    </PageShell>
  );
};
