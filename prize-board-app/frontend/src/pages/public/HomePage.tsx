import { useEffect, useState } from 'react';
import { BoardCard } from '../../components/BoardCard';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const HomePage = () => {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    boardService.listBoards().then(setBoards).catch(() => setBoards([]));
  }, []);

  return (
    <PageShell title="Live Prize Boards" subtitle="Swipe, buy entries, and win big.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => <BoardCard key={board.id} board={board} />)}
      </div>
    </PageShell>
  );
};
