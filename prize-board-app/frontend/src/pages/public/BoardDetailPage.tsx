import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { boardService } from '../../services/boardService';
import type { Board } from '../../types';

export const BoardDetailPage = () => {
  const { boardId = '' } = useParams();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    boardService.getBoard(boardId).then(setBoard).catch(() => setBoard(null));
  }, [boardId]);

  if (!board) return <PageShell title="Board" subtitle="Loading board details..."><Card>Board not found.</Card></PageShell>;

  return (
    <PageShell title={board.title} subtitle={board.description}>
      <Card>
        <p className="text-sm">Prize: <strong>{board.prize}</strong></p>
        <p className="text-sm">Entry Price: <strong>${board.entryPrice}</strong></p>
        <p className="text-sm">Spots: <strong>{board.soldSpots}/{board.totalSpots}</strong></p>
        <Link to={`/boards/${board.id}/enter`} className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Buy Entries</Link>
      </Card>
    </PageShell>
  );
};
