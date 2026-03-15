import { useEffect, useState } from 'react';
import { BoardCard } from '../../components/BoardCard';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';
import { realtimeService } from '../../services/realtimeService';
import type { Board } from '../../types';

export const HomePage = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    boardService.listBoards().then(setBoards).catch(() => setBoards([]));

    const refreshBoards = async () => {
      const next = await boardService.listBoards();
      setBoards(next);
      return next;
    };

    realtimeService.startBoardEventFeed(refreshBoards);

    const offProgress = realtimeService.on('board_progress', (board: Board) => {
      setBoards((current) => current.map((item) => (item.id === board.id ? board : item)));
    });

    const offBoardFull = realtimeService.on('board_full', (event: { boardId?: string }) => {
      setStatus(`Board ${event.boardId ?? ''} is now full.`.trim());
    });

    return () => {
      offProgress();
      offBoardFull();
    };
  }, []);

  return (
    <PageShell title="Live Prize Boards" subtitle="Swipe, buy entries, and win big.">
      {status ? <p className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{status}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => <BoardCard key={board.id} board={board} />)}
      </div>
    </PageShell>
  );
};
