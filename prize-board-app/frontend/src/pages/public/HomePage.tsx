import { useEffect, useState } from 'react';
import { BoardCard } from '../../components/BoardCard';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const HomePage = () => {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    boardService.getActiveBoards().then(setBoards).catch(() => setBoards([]));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold">Win premium prizes with every swipe</h1>
      <p className="mt-2 text-slate-300">Join active boards, grab entries, and level up your XP rewards.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </section>
  );
};
